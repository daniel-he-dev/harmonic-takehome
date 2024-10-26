import { DataGrid, GridRowId } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import {
  addCompanyToCollection,
  bulkAddCompaniesToCollection,
  getCollectionsById,
  ICollection,
  ICompany,
} from "../utils/jam-api";
import { Card, Snackbar } from "@mui/material";
import AddCompanyMenu from "./AddCompanyMenu";
import TaskProgress from "./TaskProgress";

const CompanyTable = (props: {
  selectedCollectionId: string;
  listName: string;
  availableCollections?: ICollection[];
}) => {
  const [snackMessage, setSnackMessage] = useState<string | undefined>();
  const [response, setResponse] = useState<ICompany[]>([]);
  const [total, setTotal] = useState<number>();
  const [offset, setOffset] = useState<number>(0);
  const [pageSize, setPageSize] = useState(25);
  const [selectedRows, setSelectedRows] = useState<readonly GridRowId[]>([]);
  const [activeTask, setActiveTask] = useState<string | undefined>();

  useEffect(() => {
    getCollectionsById(props.selectedCollectionId, offset, pageSize).then(
      (newResponse) => {
        setResponse(newResponse.companies);
        setTotal(newResponse.total);
      }
    );
  }, [props.selectedCollectionId, offset, pageSize]);

  useEffect(() => {
    setSelectedRows([]);
    setOffset(0);
  }, [props.selectedCollectionId]);

  const handleAddToList = async (collection: ICollection) => {
    const numAdded = selectedRows.length;
    try {
      await Promise.allSettled(
        selectedRows.map((row) =>
          addCompanyToCollection(row.toString(), collection.id)
        )
      );
      setSnackMessage(
        numAdded + " companies added to " + collection.collection_name
      );
    } catch (error) {
      console.error("Error adding companies to collection:", error);
    } finally {
      setSelectedRows([]);
    }
  };

  const handleMoveAllToAnotherList = async (collection: ICollection) => {
    setSelectedRows([]);
    const { task_id: taskId } = await bulkAddCompaniesToCollection(
      props.selectedCollectionId,
      collection.id
    );
    setActiveTask(taskId);
  };
  return (
    <div style={{ height: 800, width: "100%" }}>
      {activeTask && (
        <TaskProgress
          taskId={activeTask}
          onClose={() => setActiveTask(undefined)}
        />
      )}
      {selectedRows.length ? (
        <div className="flex flex-row gap-2">
          <Card className="rounded-md py-2 px-3 mb-2 flex gap-8 items-center">
            <span>{selectedRows.length} companies selected</span>
            <AddCompanyMenu
              title={"Add to another List"}
              selectedCollectionId={props.selectedCollectionId}
              availableCollections={props.availableCollections ?? []}
              handleAddToList={handleAddToList}
            />
          </Card>
          <Card className="rounded-md py-2 px-3 mb-2 flex gap-8">
            <AddCompanyMenu
              title={"Add all"}
              selectedCollectionId={props.selectedCollectionId}
              availableCollections={props.availableCollections ?? []}
              handleAddToList={handleMoveAllToAnotherList}
            />
          </Card>
        </div>
      ) : (
        <div className="font-bold text-2xl py-2 mb-2 text-left">
          {props.listName}
        </div>
      )}
      <DataGrid
        key={props.selectedCollectionId + snackMessage}
        rows={response}
        rowHeight={30}
        columns={[
          { field: "liked", headerName: "Liked", width: 90 },
          { field: "id", headerName: "ID", width: 90 },
          { field: "company_name", headerName: "Company Name", width: 200 },
        ]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 25 },
          },
        }}
        rowCount={total}
        pagination
        checkboxSelection
        paginationMode="server"
        onPaginationModelChange={(newMeta) => {
          setPageSize(newMeta.pageSize);
          setOffset(newMeta.page * newMeta.pageSize);
        }}
        onRowSelectionModelChange={(newSelection) => {
          setSelectedRows(newSelection);
        }}
      />
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={!!snackMessage}
        onClose={() => setSnackMessage(undefined)}
        message={snackMessage}
      />
    </div>
  );
};

export default CompanyTable;
