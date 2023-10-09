"use client";
import { invoke } from "@tauri-apps/api/tauri";
import { useRef, useState } from "react";

const defaultData = {
  servers: "localhost:9092",
  partition: 0,
  topic: "",
  key: "",
  value: "",
};

export default function Home() {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  const submit = (e: any) => {
    e.preventDefault();
    if (loading) return;
    setMsg("");
    let data: { [prop: string]: string | number } = { ...defaultData };
    Object.keys(data).forEach((key) => {
      const val: any = e.target.elements[key].value;
      data[key] = val;
      if (key === "partition") {
        data[key] = parseInt(val);
      }
    });
    console.log(data);

    setLoading(true);
    invoke<string>("sink_kafka", { data })
      .then((m) => {
        onOpen(m);
      })
      .catch(() => {
        onOpen("发送失败！");
      })
      .finally(() => setLoading(false));
  };

  const onOpen = (m: string) => {
    setMsg(m);
    ref.current?.showModal();
  };

  const onClose = () => {
    setMsg("");
    ref.current?.close();
  };

  return (
    <main className="min-h-screen p-2">
      <form onSubmit={(e) => submit(e)}>
        <div className="grid grid-cols-2 gap-x-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Broker 地址:</span>
            </label>
            <input
              type="text"
              name="servers"
              defaultValue={defaultData.servers}
              required
              className="input input-sm input-primary w-full"
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Partition:</span>
            </label>
            <input
              type="number"
              name="partition"
              defaultValue={defaultData.partition}
              required
              className="input input-sm input-primary w-full"
            />
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Topic:</span>
            </label>
            <input
              type="text"
              name="topic"
              placeholder=""
              required
              className="input input-sm input-primary w-full"
            />
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Key:</span>
            </label>
            <input
              type="text"
              name="key"
              placeholder=""
              className="input input-sm input-primary w-full"
            />
          </div>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Value:</span>
          </label>
          <textarea
            name="value"
            placeholder=""
            required
            className="textarea textarea-primary w-full"
          />
        </div>

        <button className="btn btn-primary btn-sm mt-2" type="submit">
          {loading ? <span className="loading loading-spinner"></span> : null}
          发送
        </button>
      </form>

      <dialog id="my_modal_1" ref={ref} className="modal">
        <div className="modal-box">
          <form method="dialog" onSubmit={onClose}>
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">提示</h3>
          <p className="py-4">{msg}</p>
        </div>
      </dialog>
    </main>
  );
}
