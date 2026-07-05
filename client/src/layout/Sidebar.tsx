// import { useState } from 'react'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from '@headlessui/react'
import {
  Settings as Cog6ToothIcon,
  Folder as FolderIcon,
  Home as HomeIcon,
  PresentationIcon,
  X as XMarkIcon,
  HistoryIcon
} from 'lucide-react';
// import axios from 'axios'
// import { setIsSliderOpen } from '@/Store/Slice/SliderSlice'
import { Link, 
  // useParams ,
  useLocation } from 'react-router-dom';

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<React.ComponentProps<'svg'>>
  current: boolean
}

interface SliderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const navigation: NavigationItem[] = [
  { name: 'Request', href: '/request', icon: HomeIcon, current: true },
  { name: 'Collections', href: '/collections', icon: PresentationIcon, current: false },
  { name: 'History', href: '/history', icon: HistoryIcon, current: false },
  { name: 'Environments', href: '/environments', icon: FolderIcon, current: false }
]

function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export default function Slider({ sidebarOpen, setSidebarOpen }: SliderProps) {
  // const dispatch = useDispatch()
  const location = useLocation();
  const pathName = location.pathname

  return (
    <>
      <Dialog open={sidebarOpen} onClose={() => setSidebarOpen(false)} className="relative z-50 lg:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-900/80 dark:bg-gray-950/90 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />

        <div className="fixed inset-0 flex">
          <DialogPanel
            transition
            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <TransitionChild>
              <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="-m-2.5 p-2.5"
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon aria-hidden="true" className="size-6 text-white dark:text-gray-300" />
                </button>
              </div>
            </TransitionChild>
            {/* Sidebar component for mobile */}
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 px-6 pb-4 ring-1 ring-gray-200 dark:ring-gray-800">
              <div className="flex h-16 shrink-0 items-center">
                <div className="text-2xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AutoAPI
                </div>
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={classNames(
                              pathName === item.href
                                ? 'bg-blue-50 dark:bg-gray-800 text-blue-700 dark:text-white'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
                              'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-colors duration-200'
                            )}
                          >
                            <item.icon
                              aria-hidden="true"
                              className={classNames(
                                pathName === item.href
                                  ? 'text-blue-600 dark:text-white'
                                  : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200',
                                'size-6 shrink-0'
                              )}
                            />
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                  <li>
                    <div className="text-xs/6 font-semibold text-gray-500 dark:text-gray-400">Your teams</div>
                  </li>
                  <li className="mt-auto">
                    <Link
                      to="#"
                      className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                    >
                      <Cog6ToothIcon
                        aria-hidden="true"
                        className="size-6 shrink-0 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200"
                      />
                      Settings
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-42 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 px-4 pb-4 border-r border-gray-200 dark:border-gray-800">
          <div className="flex h-16 shrink-0 items-center">
            <Link to={`/`}>
              <div className="text-2xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AutoAPI
              </div>
            </Link>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={classNames(
                          pathName === item.href
                            ? 'bg-blue-50 dark:bg-gray-800 text-blue-700 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
                          'group flex gap-x-3 rounded-md p-2 text-sm font-semibold transition-colors duration-200'
                        )}
                      >
                        <item.icon
                          aria-hidden="true"
                          className={classNames(
                            pathName === item.href
                              ? 'text-blue-600 dark:text-white'
                              : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200',
                            'size-5 shrink-0'
                          )}
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                {/* <div className="text-xs/6 font-semibold text-gray-500 dark:text-gray-400">Your teams</div> */}
              </li>
              <li className="mt-auto">
                <Link
                  to="#"
                  className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  <Cog6ToothIcon
                    aria-hidden="true"
                    className="size-6 shrink-0 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200"
                  />
                  Settings
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}