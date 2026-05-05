import { useEffect, useState } from "react";

export default function App() {
  const [loading, setLoading] = useState(true);

  const [name, setname] = useState("");
  const [file, setfile] = useState(null);
  const [parentid, setparentid] = useState(null);
  const [path, setpath] = useState([]);
  const [data, setdata] = useState([]);
  const [editid, seteditid] = useState(null);
  const [search, setsearch] = useState("");
  const [preview, setpreview] = useState(null);

  const BASE_URL = "https://drive-backend-fwgl.onrender.com";

  /* ---------------- LOADER ---------------- */
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  /* ---------------- DATA ---------------- */
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

  /* ---------------- UPLOAD ---------------- */
  const addtask = async (e) => {
    e.preventDefault();

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

  /* ================= LOADING SCREEN ================= */
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black overflow-hidden relative">
        {/* glowing orbs */}
        <div className="absolute w-[300px] h-[300px] bg-pink-500 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute w-[300px] h-[300px] bg-purple-600 blur-[120px] rounded-full animate-ping"></div>

        {/* spinning ring */}
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-pink-500 border-r-purple-500 animate-spin"></div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-transparent bg-clip-text animate-pulse">
            SHIYAN DRIVE
          </h1>

          <p className="text-xs text-gray-400 tracking-widest">
            Entering your space...
          </p>
        </div>

        {/* CSS animation keyframe fallback */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}</style>
      </div>
    );
  }

  /* ================= MAIN APP ================= */
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-[400px] h-[400px] bg-purple-600 blur-[150px] rounded-full top-10 left-10 animate-pulse"></div>
        <div className="absolute w-[400px] h-[400px] bg-pink-500 blur-[150px] rounded-full bottom-10 right-10 animate-pulse"></div>
      </div>

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl px-3 py-3 space-y-2 border-b border-white/10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
          SHIYAN DRIVE
        </h1>

        <input
          value={search}
          onChange={(e) => setsearch(e.target.value)}
          placeholder="Search files..."
          className="w-full bg-white/10 px-3 py-2 rounded-xl outline-none"
        />

        <form onSubmit={addtask} className="flex gap-2 flex-wrap">
          <input
            value={name}
            onChange={(e) => setname(e.target.value)}
            placeholder="File / Folder name"
            className="flex-1 px-3 py-2 rounded-xl bg-white/10"
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
            Upload
          </button>
        </form>
      </header>

      {/* breadcrumb */}
      <div className="pt-[180px] px-3 text-xs flex gap-2 overflow-x-auto">
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
      <main className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-32">
        {filteredData.map((item) => (
          <div
            key={item._id}
            className="bg-white/5 border border-white/10 rounded-2xl p-2 hover:scale-105 transition cursor-pointer"
          >
            <div
              onClick={() => openFolder(item)}
              onDoubleClick={() => item.file && setpreview(item.file)}
              className="h-28 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden"
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

            <div className="flex justify-between text-xs mt-2">
              <button
                onClick={() => deletes(item._id)}
                className="text-red-400"
              >
                Delete
              </button>

              <button className="text-yellow-400">Edit</button>
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
