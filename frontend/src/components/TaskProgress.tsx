import React, { useEffect, useState } from "react";
import { Button, LinearProgress } from "@mui/material";
import { getTaskStatus } from "../utils/jam-api";

interface TaskProgressProps {
  taskId: string;
  onClose: () => void;
}

const TaskProgress: React.FC<TaskProgressProps> = ({ taskId, onClose }) => {
  const [status, setStatus] = useState<string | undefined>();

  useEffect(() => {
    const intervalId = setInterval(() => {
      getTaskStatus(taskId).then((response) => {
        setStatus(response.status);
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [taskId]);

  return (
    <div className="flex flex-row items-center gap-4 border-gray-400 border rounded-md p-2">
      <span>{`Adding all companies to other list`}</span>
      <LinearProgress
        className="flex-1"
        variant={
          !status || status === "In Progress" ? "indeterminate" : "determinate"
        }
        value={status === "completed" ? 100 : undefined}
      />
      {status === "completed" && <Button onClick={onClose}>Close</Button>}
    </div>
  );
};

export default TaskProgress;
