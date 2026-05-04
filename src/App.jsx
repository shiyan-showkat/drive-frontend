import { useEffect, useState } from "react";

export default function App() {
  const [name, setname] = useState("");
  const [file, setfile] = useState(null);
  const [parentid, setparentid] = useState(null);
  const [path, setpath] = useState([]);
  const [data, setdata] = useState([]);
  const [editid, seteditid] = useState(null);
  const [search, setsearch] = useState("");
  const [preview, setpreview] = useState(null);

  const BASE_URL = "https://drive-backend-fwgl.onrender.com";

  const getdata = async () => {
    let url = `${BASE_URL}/api/v2/getfile`;
    if (parentid) url = `${BASE_URL}/api/v2/getfile/${parentid}`;

    const res = await fetch(url);
    const result = await res.json();
    setdata(result);
  };

  useEffect(() => {
    getdata();
  }, [parentid]);

  const addtask = async (e) => {
    e.preventDefault();

    if (editid) {
      await fetch(`${BASE_URL}/api/v2/updatefile/${editid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      seteditid(null);
      setname("");
      getdata();
      return;
    }

    const formdata = new FormData();
    formdata.append("name", name);
    if (file) formdata.append("file", file);
    if (parentid) formdata.append("parentid", parentid);

    await fetch(`${BASE_URL}/api/v2/createfile`, {
      method: "POST",
      body: formdata,
    });

    setname("");
    setfile(null);
    getdata();
  };

  const deletes = async (id) => {
    await fetch(`${BASE_URL}/api/v2/deletefile/${id}`, {
      method: "DELETE",
    });
    getdata();
  };

  const openFolder = (item) => {
    if (item.type === "folder") {
      setparentid(item._id);
      setpath([...path, item]);
    }
  };

  const goBack = () => {
    const newPath = [...path];
    newPath.pop();
    const last = newPath[newPath.length - 1];

    setpath(newPath);
    setparentid(last ? last._id : null);
  };

  const isImage = (file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file);

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#0b0a10] text-white flex flex-col">
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2070"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* HEADER (MOBILE SAFE) */}
      <header className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl px-3 py-2 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h1 className="text-purple-400 font-bold text-lg">Shiyan Drive</h1>
        </div>

        <input
          value={search}
          onChange={(e) => setsearch(e.target.value)}
          placeholder="Search files..."
          className="w-full bg-white/10 px-3 py-2 rounded-lg text-sm"
        />

        <form onSubmit={addtask} className="flex gap-2 items-center flex-wrap">
          <input
            value={name}
            onChange={(e) => setname(e.target.value)}
            placeholder="Name"
            className="flex-1 min-w-[120px] bg-white/10 px-3 py-2 rounded-lg text-sm"
          />

          <input
            type="file"
            id="file"
            onChange={(e) => setfile(e.target.files[0])}
            className="hidden"
          />

          <label
            htmlFor="file"
            className="bg-white/10 px-3 py-2 rounded-lg cursor-pointer text-sm"
          >
            📁
          </label>

          <button className="bg-purple-600 px-4 py-2 rounded-lg text-sm">
            {editid ? "Update" : "Upload"}
          </button>
        </form>
      </header>

      {/* BREADCRUMB (FIXED MOBILE SCROLL) */}
      <div className="pt-28 px-3 flex gap-2 text-xs overflow-x-auto whitespace-nowrap">
        <span
          onClick={() => {
            setparentid(null);
            setpath([]);
          }}
          className="cursor-pointer text-white"
        >
          Home /
        </span>

        {path.map((p, i) => (
          <span
            key={i}
            onClick={() => {
              setparentid(p._id);
              setpath(path.slice(0, i + 1));
            }}
            className="cursor-pointer text-gray-300"
          >
            {p.name} /
          </span>
        ))}
      </div>

      {/* GRID (MOBILE FIXED CARDS) */}
      <main className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-24">
        {filteredData.map((item) => (
          <div
            key={item._id}
            className="bg-white/5 rounded-xl border border-white/10 p-2"
          >
            <div
              onClick={() => openFolder(item)}
              onDoubleClick={() => item.file && setpreview(item.file)}
              className="h-24 sm:h-32 bg-black/30 rounded-lg flex items-center justify-center overflow-hidden"
            >
              {item.type === "folder" ? (
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3767/3767084.png"
                  className="w-14 sm:w-16"
                />
              ) : item.file && isImage(item.file) ? (
                <img src={item.file} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs">📄</span>
              )}
            </div>

            <p className="text-xs mt-2 truncate">{item.name}</p>

            <div className="flex justify-between text-[10px] mt-2">
              <button
                onClick={() => deletes(item._id)}
                className="text-red-400"
              >
                Del
              </button>

              <button
                onClick={() => seteditid(item._id)}
                className="text-yellow-400"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* 🔙 MOBILE FIXED BACK BUTTON (BOTTOM FLOAT) */}
      {parentid && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:hidden">
          <button
            onClick={goBack}
            className="bg-red-500 px-5 py-2 rounded-full shadow-lg"
          >
            ← Back
          </button>
        </div>
      )}

      {/* PREVIEW */}
      {preview && (
        <div
          onClick={() => setpreview(null)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center"
        >
          <img src={preview} className="max-w-[90%] max-h-[80%] rounded-xl" />
        </div>
      )}

      {/* FOOTER */}
      <footer className="text-center py-3 text-xs text-gray-400 border-t border-white/10 mt-auto">
        Made with ❤️ by <span className="text-purple-400">Shiyan</span>
      </footer>
    </div>
  );
}
