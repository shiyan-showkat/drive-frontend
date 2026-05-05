import { useEffect, useState } from "react";

export default function App() {
  const [loading, setLoading] = useState(true);

  const [name, setname] = useState("");
  const [file, setfile] = useState(null);
  const [parentid, setparentid] = useState(null);
  const [path, setpath] = useState([]);
  const [data, setdata] = useState([]);
  const [search, setsearch] = useState("");
  const [preview, setpreview] = useState(null);
  const [editid, seteditid] = useState(null);

  const BASE_URL = "https://drive-backend-fwgl.onrender.com";

  /* ================= LOADER ================= */
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  /* ================= GET DATA ================= */
  const getdata = async () => {
    let url = `${BASE_URL}/api/v2/getfile`;
    if (parentid) url = `${BASE_URL}/api/v2/getfile/${parentid}`;

    const res = await fetch(url);
    const result = await res.json();
    setdata(result);
  };

  useEffect(() => {
    if (!loading) getdata();
  }, [parentid, loading]);

  /* ================= CREATE / UPDATE ================= */
  const addtask = async (e) => {
    e.preventDefault();

    // UPDATE MODE
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

    // CREATE MODE
    const form = new FormData();
    form.append("name", name);
    if (file) form.append("file", file);
    if (parentid) form.append("parentid", parentid);

    await fetch(`${BASE_URL}/api/v2/createfile`, {
      method: "POST",
      body: form,
    });

    setname("");
    setfile(null);
    getdata();
  };

  /* ================= DELETE ================= */
  const deleteItem = async (id) => {
    await fetch(`${BASE_URL}/api/v2/deletefile/${id}`, {
      method: "DELETE",
    });

    getdata();
  };

  /* ================= OPEN FOLDER ================= */
  const openFolder = (item) => {
    if (item.type === "folder") {
      setparentid(item._id);
      setpath([...path, item]);
    }
  };

  /* ================= BACK ================= */
  const goBack = () => {
    const newPath = [...path];
    newPath.pop();
    const last = newPath[newPath.length - 1];
    setpath(newPath);
    setparentid(last ? last._id : null);
  };

  const isImage = (f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f);

  /* ================= LOADER UI ================= */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black relative overflow-hidden">
        {/* glowing background */}
        <div className="absolute w-[500px] h-[500px] bg-purple-600 blur-[180px] rounded-full top-10 left-10 animate-pulse"></div>
        <div className="absolute w-[400px] h-[400px] bg-pink-500 blur-[180px] rounded-full bottom-10 right-10 animate-pulse"></div>

        {/* ORBIT */}
        <div className="relative flex flex-col items-center gap-6">
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 rounded-full border border-purple-500 animate-spin"></div>
            <div className="absolute inset-4 rounded-full border border-pink-500 animate-spin [animation-duration:3s]"></div>
            <div className="absolute inset-8 rounded-full border border-blue-500 animate-spin [animation-duration:2s]"></div>
            <div className="absolute inset-12 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 blur-md animate-pulse"></div>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
            SHIYAN
          </h1>

          <p className="text-xs text-gray-400 tracking-[6px]">ENTERING DRIVE</p>
        </div>
      </div>
    );
  }

  /* ================= MAIN UI ================= */
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-[500px] h-[500px] bg-purple-600 blur-[180px] rounded-full top-10 left-10"></div>
        <div className="absolute w-[400px] h-[400px] bg-pink-500 blur-[180px] rounded-full bottom-10 right-10"></div>
      </div>

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl px-3 py-3 border-b border-white/10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
          SHIYAN DRIVE
        </h1>

        <input
          value={search}
          onChange={(e) => setsearch(e.target.value)}
          placeholder="Search files..."
          className="w-full mt-2 px-3 py-2 rounded-xl bg-white/10 outline-none"
        />

        <form onSubmit={addtask} className="flex gap-2 mt-2">
          <input
            value={name}
            onChange={(e) => setname(e.target.value)}
            placeholder="File / Folder name"
            className="flex-1 px-3 py-2 rounded-xl bg-white/10 outline-none"
          />

          <input
            type="file"
            id="file"
            onChange={(e) => setfile(e.target.files[0])}
            className="hidden"
          />

          <label className="px-3 py-2 bg-white/10 rounded-xl cursor-pointer">
            📁
          </label>

          <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500">
            {editid ? "Update" : "Upload"}
          </button>
        </form>
      </header>

      {/* BREADCRUMB */}
      <div className="pt-[150px] px-3 flex gap-2 text-xs overflow-x-auto">
        <span
          onClick={() => {
            setparentid(null);
            setpath([]);
          }}
          className="cursor-pointer"
        >
          Home /
        </span>

        {path.map((p, i) => (
          <span key={i} className="text-gray-300">
            {p.name} /
          </span>
        ))}
      </div>

      {/* GRID */}
      <main className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-24">
        {data
          .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
          .map((item) => (
            <div
              key={item._id}
              className="bg-white/5 border border-white/10 rounded-2xl p-2 hover:scale-105 transition cursor-pointer"
            >
              <div
                onClick={() => openFolder(item)}
                onDoubleClick={() => item.file && setpreview(item.file)}
                className="h-28 rounded-xl overflow-hidden flex items-center justify-center bg-white/5"
              >
                {item.type === "folder" ? (
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3767/3767084.png"
                    className="w-14"
                  />
                ) : item.file && isImage(item.file) ? (
                  <img src={item.file} className="w-full h-full object-cover" />
                ) : (
                  <span>📄</span>
                )}
              </div>

              <p className="text-xs mt-2 truncate">{item.name}</p>

              {/* ACTIONS */}
              <div className="flex justify-between mt-2 text-[11px]">
                <button
                  onClick={() => deleteItem(item._id)}
                  className="text-red-400"
                >
                  Delete
                </button>

                <button
                  onClick={() => {
                    setname(item.name);
                    seteditid(item._id);
                  }}
                  className="text-yellow-400"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
      </main>

      {/* BACK */}
      {parentid && (
        <button
          onClick={goBack}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-white/10 px-5 py-2 rounded-full backdrop-blur-xl"
        >
          ← Back
        </button>
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
      <footer className="fixed bottom-0 w-full text-center py-2 text-xs text-gray-400 bg-black/60 backdrop-blur-xl border-t border-white/10">
        Made with ❤️ by <span className="text-purple-400">Shiyan</span>
      </footer>
    </div>
  );
}
