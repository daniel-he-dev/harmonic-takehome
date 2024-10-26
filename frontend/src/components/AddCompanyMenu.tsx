import React from "react";
import { Menu, MenuItem, Button } from "@mui/material";
import { ICollection } from "../utils/jam-api";

const AddCompanyMenu = ({
  title,
  selectedCollectionId,
  availableCollections,
  handleAddToList,
}: {
  title: string;
  selectedCollectionId: string;
  availableCollections: ICollection[];
  handleAddToList: (col: ICollection) => Promise<void>;
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  return (
    <>
      <Button
        color="inherit"
        size="small"
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        {title}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {(availableCollections ?? []).map((c) => (
          <MenuItem
            key={c.id}
            onClick={() => handleAddToList(c)}
            disabled={selectedCollectionId === c.id}
          >
            {c.collection_name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default AddCompanyMenu;
