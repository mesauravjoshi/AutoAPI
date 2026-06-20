import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import {
  ClockIcon,
  LinkIcon,
  TrashIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useDispatch } from "react-redux";
// import { AppDispatch } from "@/store/Store";
import { addCollectionTab } from "@/store/Slice/tabSlice";
import Tooltip from "@/components/Tooltip";
import { MethodsTypes } from "@/types/types";
import { methodBadge } from '@/utils/getMethodStyles'
import { useAuth } from "@/hooks/useAuth";

interface RequestItem {
  _id: string;
  name: string;
  method: MethodsTypes;
  url: string;
  headers: any[];
  queryParams: any[];
  body: {
    type: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface CollectionItem {
  _id: string;
  name: string;
  description?: string;

  workspace: {
    _id: string;
    name: string;
  };

  createdBy: {
    _id: string;
    username: string;
    email: string;
  };

  requests: RequestItem[];
  requestCount: number;
}

function RequestCard({
  request,
  onDelete,
}: {
  request: RequestItem;
  onDelete: (id: string) => void;
}) {
  // console.log('request', request);
  const dispatch = useDispatch();

  const handleClick = () => {
    // console.log(request);
    // return
    dispatch(
      addCollectionTab(request)
    );
  };

  return (
    <div
      className="group rounded-xl border border-gray-200 dark:border-gray-800 p-2 transition hover:shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1 mb-1">
            <span
              className={`px-2.5 py-1 rounded-full text-sm font-semibold ${methodBadge(
                request.method
              )}`}
            >
              {request.method}
            </span>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <LinkIcon className="w-4 h-4 opacity-50 shrink-0" />

            <Tooltip content={request.url}>
              <p className="truncate text-sm font-medium">
                {request.url}
              </p>
            </Tooltip>
          </div>
        </div>

        <TrashIcon
          className="w-4 h-4 cursor-pointer hover:text-red-500 transition-colors z-10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(request._id);
          }}
        />
      </div>
    </div>
  );
}

function CollectionAccordion({
  collection,
  onDelete,
  onDeleteCollection,
}: {
  collection: CollectionItem;
  onDelete: (id: string) => void;
  onDeleteCollection: (collection: CollectionItem) => void;
}) {
  const [open, setOpen] = useState(true);
  // console.log(collection);

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold">{collection.name}</span>

          <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs">
            {collection.requestCount}
          </span>
        </div>

        <ChevronDownIcon
          className={`w-5 h-5 transition-transform duration-300 ${open ? "rotate-180" : ""
            }`}
        />
        <TrashIcon
          className="size-4 cursor-pointer hover:text-red-500 transition-colors z-10"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteCollection(collection);
          }}
        />
      </button>

      <div
        className={`transition-all duration-300 overflow-hidden ${open ? "max-h-125 overflow-y-auto" : "max-h-0"
          }`}
      >
        <div className="p-4 pt-0 space-y-3">
          {collection.requests.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">
              No requests found
            </p>
          ) : (
            collection.requests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-16 text-center">
      <ClockIcon className="mx-auto h-14 w-14 opacity-40" />

      <p className="mt-4 opacity-70">
        No Collections found
      </p>
    </div>
  );
}

export default function CollectionComponent() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const { currentWorkspace } = useAuth();
  // console.log(user);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<CollectionItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    try {
      // The current backend controller expects name, url, and method.
      await api.post("/collection", {
        name: newCollectionName,
        workspaceId: currentWorkspace?._id,
      });
      setIsModalOpen(false);
      setNewCollectionName("");

      // Re-fetch to get properly populated collection (with requests array)
      const res = await api.get("/collection");
      setCollections(res.data.collections);
    } catch (error) {
      console.error("Failed to create collection:", error);
    }
  };

  const handleDeleteCollection = async () => {
    if (!selectedCollection) return;

    try {
      setDeleteLoading(true);

      await api.delete(`/collection/${selectedCollection._id}`);

      setCollections((prev) =>
        prev.filter((c) => c._id !== selectedCollection._id)
      );

      setDeleteModalOpen(false);
      setSelectedCollection(null);
    } catch (error: any) {
      console.error(
        "Delete collection failed:",
        error?.response?.data?.message || error.message
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await api.get("/collection");

        setCollections(res.data.collections);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCollections = useMemo(() => {
    if (!search.trim()) return collections;

    return collections.filter((collection) => {
      const searchLower = search.toLowerCase();

      return (
        collection.name.toLowerCase().includes(searchLower) ||
        collection.requests.some(
          (req) =>
            req.url.toLowerCase().includes(searchLower) ||
            req.method.toLowerCase().includes(searchLower) ||
            req.name.toLowerCase().includes(searchLower)
        )
      );
    });
  }, [collections, search]);

  const handleRemoveRequest = async (id: string) => {
    try {
      await api.delete(`/request/${id}`);

      setCollections((prev) =>
        prev.map((collection) => ({
          ...collection,
          requests: collection.requests.filter((req) => req._id !== id),
          requestCount: collection.requests.filter((req) => req._id !== id)
            .length,
        }))
      );
    } catch (error: any) {
      console.error(
        "Delete failed:",
        error?.response?.data?.message || error.message
      );
    }
  };

  return (
    <aside className="w-[30%] h-screen border-r text-sm border-gray-200 dark:border-gray-800">
      <div className="h-full overflow-y-auto p-3">

        <div className="flex px-3 pb-3 gap-3 items-start">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search collections..."
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-lg font-semibold text-white cursor-pointer"
            onClick={() => setIsModalOpen(true)}
            title="Create Collection"
          >
            +
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-xl animate-pulse bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : filteredCollections.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {filteredCollections.map((collection) => (
              <CollectionAccordion
                key={collection._id}
                collection={collection}
                onDelete={handleRemoveRequest}
                onDeleteCollection={(collection) => {
                  setSelectedCollection(collection);
                  setDeleteModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Collection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Create Collection</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Collection Name
                </label>
                <input
                  autoFocus
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateCollection();
                  }}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., User API"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewCollectionName("");
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCollection}
                  disabled={!newCollectionName.trim()}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Collection Modal */}
      {deleteModalOpen && selectedCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl p-6">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Delete Collection
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {selectedCollection.name}
              </span>
              ?
            </p>

            <p className="text-xs text-gray-500 mt-2">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedCollection(null);
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteCollection}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}