
import React from "react";
import { Layout } from "@/components/Layout";
import { TaskManager } from "@/components/tasks/TaskManager";

const Tasks = () => {
  return (
    <Layout title="Tasks">
      <TaskManager />
    </Layout>
  );
};

export default Tasks;
