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

  // OPEN FOLDER + BREADCRUMB
  const openFolder = (item) => {
    if (item.type === "folder") {
      setparentid(item._id);
      setpath([...path, item]);
    }
  };

  const goBackTo = (index) => {
    const newPath = path.slice(0, index + 1);
    setpath(newPath);
    setparentid(newPath[index]?._id || null);
  };

  const isImage = (file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file);

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  // DRAG & DROP
  const handleDrop = (e) => {
    e.preventDefault();
    setfile(e.dataTransfer.files[0]);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="bg-[#0f0c14] text-white min-h-screen"
    >
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2070"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/40 to-black"></div>
      </div>

      {/* HEADER */}
      <header className="fixed top-0 w-full flex flex-col md:flex-row gap-3 md:gap-0 justify-between items-start md:items-center px-4 py-3 bg-black/40 backdrop-blur-xl z-50">
        <h1 className="text-xl font-bold text-purple-400">Shiyan Drive</h1>

        <input
          value={search}
          onChange={(e) => setsearch(e.target.value)}
          placeholder="Search..."
          className="w-full md:w-64 bg-white/10 px-3 py-2 rounded-lg"
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
            className="px-3 py-2 bg-white/10 rounded-lg cursor-pointer"
          >
            📁
          </label>

          <button className="bg-purple-600 px-4 py-2 rounded-lg">
            {editid ? "Update" : "Upload"}
          </button>
        </form>
      </header>

      {/* BREADCRUMB */}
      <div className="pt-24 px-4 text-sm text-gray-300 flex gap-2 flex-wrap">
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
            onClick={() => goBackTo(i)}
            className="cursor-pointer hover:text-white"
          >
            {p.name} /
          </span>
        ))}
      </div>

      {/* MAIN */}
      <main className="p-4 md:ml-0 grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredData.map((item) => (
          <div
            key={item._id}
            className="bg-white/5 p-3 rounded-xl hover:scale-105 transition cursor-pointer"
          >
            {/* FILE PREVIEW */}
            <div
              onClick={() => openFolder(item)}
              onDoubleClick={() => item.file && setpreview(item.file)}
              className="h-32 bg-black/30 flex items-center justify-center rounded-lg overflow-hidden"
            >
              {item.type === "folder" ? (
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3767/3767084.png"
                  className="w-16"
                />
              ) : item.file && isImage(item.file) ? (
                <img src={item.file} className="w-full h-full object-cover" />
              ) : (
                <span>📄</span>
              )}
            </div>

            <p className="mt-2 truncate">{item.name}</p>

            <div className="flex justify-between text-xs mt-2">
              <button
                onClick={() => deletes(item._id)}
                className="text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* FILE PREVIEW MODAL */}
      {preview && (
        <div
          onClick={() => setpreview(null)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center"
        >
          <img src={preview} className="max-w-[80%] max-h-[80%] rounded-xl" />
        </div>
      )}
    </div>
  );
}
