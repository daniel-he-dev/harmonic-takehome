import axios from "axios";

export interface ICompany {
  id: number;
  company_name: string;
  liked: boolean;
}

export interface ICollection {
  id: string;
  collection_name: string;
  companies: ICompany[];
  total: number;
}

export interface ICompanyBatchResponse {
  companies: ICompany[];
}

const BASE_URL = "http://localhost:8000";

export async function getCompanies(
  offset?: number,
  limit?: number
): Promise<ICompanyBatchResponse> {
  try {
    const response = await axios.get(`${BASE_URL}/companies`, {
      params: {
        offset,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
}

export async function getCollectionsById(
  id: string,
  offset?: number,
  limit?: number
): Promise<ICollection> {
  try {
    const response = await axios.get(`${BASE_URL}/collections/${id}`, {
      params: {
        offset,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
}

export async function getCollectionsMetadata(): Promise<ICollection[]> {
  try {
    const response = await axios.get(`${BASE_URL}/collections`);
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
}

export async function addCompanyToCollection(
  companyId: string,
  collectionId: string
) {
  try {
    const response = await axios.post(
      `${BASE_URL}/collections/${collectionId}/add-company`,
      null,
      { params: { company_id: companyId } }
    );
    return response.data as string;
  } catch (error) {
    console.error("Error adding company to list:", error);
    throw error;
  }
}

export async function bulkAddCompaniesToCollection(
  sourceCollectionId: string,
  targetCollectionId: string
) {
  try {
    const response = await axios.post(
      `${BASE_URL}/collections/bulk-add`,
      null,
      {
        params: {
          source_collection_id: sourceCollectionId,
          target_collection_id: targetCollectionId,
        },
      }
    );
    return response.data as { task_id: string };
  } catch (error) {
    console.error("Error adding company to list:", error);
    throw error;
  }
}

export async function getTaskStatus(taskId: string) {
  try {
    const response = await axios.get(
      `${BASE_URL}/collections/task-status/${taskId}`
    );
    return response.data as { status: string };
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
}
