import { notFound } from "next/navigation";
import { loadGraph } from "@/app/graph/load";
import { Editor } from "./Editor";

export default function EditPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <Editor initial={loadGraph()} />;
}
