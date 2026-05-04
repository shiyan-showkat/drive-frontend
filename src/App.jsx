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
  const [shareLink, setShareLink] = useState(null);

  const BASE_URL = "https://drive-backend-fwgl.onrender.com";

  // GET DATA
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

  // CREATE / UPDATE
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

  // DELETE
  const deletes = async (id) => {
    await fetch(`${BASE_URL}/api/v2/deletefile/${id}`, {
      method: "DELETE",
    });
    getdata();
  };

  // EDIT
  const editItem = (item) => {
    setname(item.name);
    seteditid(item._id);
  };

  // OPEN FOLDER
  const openFolder = (item) => {
    if (item.type === "folder") {
      setparentid(item._id);
      setpath([...path, item]);
    }
  };

  // BACK
  const goBack = () => {
    const newPath = [...path];
    newPath.pop();
    const last = newPath[newPath.length - 1];

    setpath(newPath);
    setparentid(last ? last._id : null);
  };

  // IMAGE CHECK
  const isImage = (file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file);

  // FILTER SEARCH
  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  // DRAG DROP
  const handleDrop = (e) => {
    e.preventDefault();
    setfile(e.dataTransfer.files[0]);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="min-h-screen bg-[#0b0a10] text-white flex flex-col"
    >
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2070"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/50 to-black" />
      </div>

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl p-3 flex flex-col md:flex-row gap-2 md:items-center">
        <h1 className="text-purple-400 font-bold text-lg md:text-xl">
          Shiyan Drive
        </h1>

        <input
          value={search}
          onChange={(e) => setsearch(e.target.value)}
          placeholder="Search files..."
          className="flex-1 bg-white/10 px-3 py-2 rounded-lg outline-none"
        />

        <form onSubmit={addtask} className="flex gap-2 flex-wrap">
          <input
            value={name}
            onChange={(e) => setname(e.target.value)}
            placeholder="Name"
            className="bg-white/10 px-3 py-2 rounded-lg"
          />

          <input
            type="file"
            id="file"
            onChange={(e) => setfile(e.target.files[0])}
            className="hidden"
          />

          <label
            htmlFor="file"
            className="bg-white/10 px-3 py-2 rounded-lg cursor-pointer"
          >
            📁
          </label>

          <button className="bg-purple-600 px-4 py-2 rounded-lg">
            {editid ? "Update" : "Upload"}
          </button>
        </form>
      </header>

      {/* BREADCRUMB */}
      <div className="pt-24 px-4 flex flex-wrap gap-2 text-sm text-gray-300">
        <span
          onClick={() => {
            setparentid(null);
            setpath([]);
          }}
          className="cursor-pointer hover:text-white"
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
            className="cursor-pointer hover:text-white"
          >
            {p.name} /
          </span>
        ))}
      </div>

      {/* BACK BUTTON MOBILE FIX */}
      {parentid && (
        <div className="px-4 mt-2 md:hidden">
          <button onClick={goBack} className="bg-red-500 px-3 py-1 rounded">
            ← Back
          </button>
        </div>
      )}

      {/* GRID */}
      <main className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredData.map((item) => (
          <div
            key={item._id}
            className="bg-white/5 p-3 rounded-xl border border-white/10"
          >
            <div
              onClick={() => openFolder(item)}
              onDoubleClick={() => item.file && setpreview(item.file)}
              className="h-28 md:h-40 bg-black/30 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer"
            >
              {item.type === "folder" ? (
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3767/3767084.png"
                  className="w-16 md:w-20"
                />
              ) : item.file && isImage(item.file) ? (
                <img src={item.file} className="w-full h-full object-cover" />
              ) : (
                <span>📄</span>
              )}
            </div>

            <p className="mt-2 text-sm truncate">{item.name}</p>

            <div className="flex justify-between text-xs mt-2">
              <button
                onClick={() => deletes(item._id)}
                className="text-red-400"
              >
                Delete
              </button>

              <button
                onClick={() => editItem(item)}
                className="text-yellow-400"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </main>

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
      <footer className="mt-auto text-center py-4 text-gray-400 text-sm border-t border-white/10">
        Made with ❤️ by <span className="text-purple-400">Shiyan</span>
      </footer>
    </div>
  );
}
