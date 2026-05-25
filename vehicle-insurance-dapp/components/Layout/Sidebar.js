import { Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Dialog, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import {
  FiHome,
  FiShield,
  FiFileText,
  FiCreditCard,
  FiX,
  FiBarChart,
  FiLock,
  FiZap,
  FiGlobe,
  FiTruck,
} from "react-icons/fi";
import { MdAdminPanelSettings } from "react-icons/md";

const NAV_ITEMS = [
  { key: "dashboard", href: "/dashboard", icon: FiHome },
  { key: "plans", href: "/plans", icon: FiShield },
  { key: "policies", href: "/policies", icon: FiFileText },
  { key: "claims", href: "/claims", icon: FiCreditCard },
  { key: "analytics", href: "/analytics", icon: FiBarChart },
  { key: "admin", href: "/admin", icon: MdAdminPanelSettings },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Sidebar = ({ open, setOpen }) => {
  const router = useRouter();
  const { t } = useTranslation();

  const SidebarContent = () => (
    <div className="relative flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4 bg-white border-r border-gray-100 shadow-sm">
      {/* Logo section */}
      <div className="flex h-16 shrink-0 items-center border-b border-gray-100">
        <Link href="/" className="flex items-center space-x-3 group/logo">
          {/* HUST Logo */}
          <div className="relative flex-shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-gray-100 shadow-md group-hover/logo:shadow-lg transition-all duration-200 overflow-hidden">
              <Image
                src="/hust-logo.png"
                alt="HUST Logo"
                width={40}
                height={40}
                className="object-contain p-0.5"
                unoptimized
              />
            </div>
            {/* Online indicator */}
            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-sm"></div>
          </div>

          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight group-hover/logo:text-red-600 transition-colors">
              VehicleChain
            </h1>
            <p className="text-xs text-red-500 font-semibold leading-none">ĐHBK Hà Nội</p>
          </div>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = router.pathname === item.href;
                const label = t(`nav.${item.key}`, item.key);
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className={classNames(
                        isActive
                          ? "bg-red-50 text-red-700 border-r-2 border-red-600"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                        "group relative flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-semibold transition-all duration-150"
                      )}
                    >
                      {/* Icon */}
                      <item.icon
                        className={classNames(
                          isActive
                            ? "text-red-600"
                            : "text-gray-400 group-hover:text-gray-600",
                          "h-5 w-5 shrink-0 transition-colors duration-150"
                        )}
                        aria-hidden="true"
                      />
                      <span>{label}</span>

                      {/* Active dot indicator */}
                      {isActive && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>

          {/* Bottom section */}
          <li className="mt-auto">
            {/* Blockchain status card */}
            <div className="mb-3 rounded-xl p-3 bg-emerald-50 border border-emerald-100">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                    <FiLock className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Blockchain Status</p>
                  <p className="text-xs text-emerald-600 font-medium">Connected & Secure</p>
                </div>
              </div>
            </div>

            {/* Feature highlight card */}
            <div className="rounded-xl p-4 bg-gradient-to-br from-red-600 to-red-700 shadow-md overflow-hidden relative">
              {/* Background shine */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,_rgba(255,255,255,0.15),_transparent_60%)]"></div>

              <div className="relative flex items-center space-x-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                  <FiShield className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">
                    Secure & Decentralized
                  </p>
                  <p className="text-xs text-red-200 font-medium">
                    Powered by Blockchain
                  </p>
                </div>
              </div>

              <div className="relative mt-3 pt-3 border-t border-white/20">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-red-100">
                    <FiZap className="h-3 w-3" />
                    <span>Gas: Low</span>
                  </div>
                  <div className="flex items-center space-x-1 text-red-100">
                    <FiGlobe className="h-3 w-3" />
                    <span>Network: Active</span>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <FiX className="h-6 w-6 text-gray-600" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>

                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;
