import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Slider from "@/layout/Sidebar";
import { NavBar } from "@/layout/Nav";
import TabComponent from "@/components/TabComponent";
import RequestForm from "@/components/Request/RequestForm";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/Store";
import { fetchTabs } from "@/store/Slice/tabSlice";
import EmptyRequest from "@/components/EmptyRequest";
import { ApiHistory } from '@/types/types'

const emptyApiHistory: ApiHistory = {
  _id: "",
  userId: "",
  url: "",
  method: "GET",
  statusCode: 0,
  responseTime: 0,
  isError: false,
  testedAt: "",
};

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchTabs());
  }, [dispatch]);

  const { tabs, activeTab } = useSelector((state: RootState) => state.tabs);
  const activeTabData = tabs.find(t => t._id === activeTab);
  console.log('tabs', tabs);
  console.log('activeTab', activeTab);
  console.log('activeTabData', activeTabData);

  useEffect(() => {
    console.log('activeTab changed');

  }, [activeTab])

  // console.log(location.pathname !== '/request' && location.pathname !== '/');
  const isNotRequestRoute = location.pathname !== '/request' && location.pathname !== '/';
  // console.log(isNotRequestRoute);
  return (
    <div>
      <Slider
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className={`lg:pl-42`}>
        <NavBar
          // sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="bg-white dark:bg-gray-900">
          <div className="flex h-screen text-gray-800 dark:text-gray-300">

            {/* Sidebar */}
            {
              isNotRequestRoute && (
                <>
                  <Outlet />
                </>
              )
            }

            {/* Main Section */}
            <div className="flex-1 flex flex-col">

              {/* Top Header */}
              <TabComponent />
              {/* <header className="h-20 border shadow flex items-center px-6">
                <h1 className="text-xl font-semibold">Header Area</h1>
              </header> */}

              {/* Content */}
              <main className="flex-1">
                {
                  tabs.length === 0 ? <EmptyRequest /> :
                    <>
                      {
                        location.pathname === '/request' ?
                          <RequestForm defaultData={emptyApiHistory} /> :
                          <RequestForm defaultData={activeTabData?.historyData} />
                      }
                    </>
                }
                {/* <div className="rounded-lg shadow h-full">
                  Main Content Area
                </div> */}
              </main>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}