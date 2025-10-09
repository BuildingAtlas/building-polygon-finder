import React from 'react';
import './BuildingFiltersPanel.css';

export default function BuildingFiltersPanel() {
  return (
    <div className="c_scope_00a3b901">
      <div className="flex flex-col gap-8 rounded border border-gray-200 bg-white shadow-sm">
        <header className="p-4 bg-gray-100 border-b border-gray-200 rounded-t flex flex-row items-center justify-between gap-4">
          <h3 className="text-blue-900 font-semibold text-lg inline-flex gap-2.5 items-center flex-grow">
            Show
            <ul className="contents">
              <li className="contents">
                <button className="contents">
                  <div className="size-4 rounded-full focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 group-focus:ring-primary-500 dark:group-focus:ring-primary-600 group-focus:ring-2 flex items-center justify-center ring-offset-2 text-white bg-primary-600 dark:bg-gray-700" role="radio" aria-checked="true">
                    <div className="bg-white rounded-full size-1.5"></div>
                  </div>
                  buildings
                </button>
              </li>
              <li className="contents">
                or
                <button className="contents">
                  <div className="size-4 rounded-full focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 group-focus:ring-primary-500 dark:group-focus:ring-primary-600 group-focus:ring-2 flex items-center justify-center ring-offset-2 text-primary-600 bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:border-gray-600" role="radio" aria-checked="false"></div>
                  units
                </button>
              </li>
            </ul>
          </h3>
          <button className="text-indigo-600 underline text-sm font-medium cursor-pointer select-none">
            Advanced search
          </button>
          <button className="font-medium text-center text-sm px-5 py-2.5 rounded-lg bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 focus:z-10 text-gray-900 hover:text-blue-700 dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-gray-600 inline-flex items-center gap-2">
            <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" aria-hidden="true">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"></path>
            </svg>
            Reset filters
          </button>
        </header>
        
        <div className="grid grid-cols-3 gap-12 px-4">
          <div className="col-start-1 flex flex-col gap-4">
            <div className="text-sm font-medium flex flex-col gap-2">
              Floor area, m²
              <div className="flex flex-row gap-4 items-center">
                <input min={0} max={38500} placeholder="0" className="w-32 flex-grow bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 placeholder-gray-400 focus:placeholder:opacity-0 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" type="number" />
                to
                <input min={0} max={38500} placeholder="38500" className="w-32 flex-grow bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 placeholder-gray-400 focus:placeholder:opacity-0 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" type="number" />
                <button className="font-medium text-center text-sm px-5 py-2.5 rounded-lg bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 focus:z-10 text-gray-900 hover:text-blue-700 dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-gray-600 hidden">
                  Update
                </button>
              </div>
            </div>
          </div>
          
          <div className="col-start-2 flex flex-col gap-4">
            <div className="text-sm font-medium flex flex-col gap-2">
              Energy use intensity, kWh/m²/year
              <div className="rounded-lg border border-gray-300 flex flex-row justify-between items-stretch min-h-12">
                <ul className="hidden has-[*]:flex flex-row flex-wrap gap-2 p-3"></ul>
                <button className="flex-grow flex justify-end p-3">
                  <svg fill="none" viewBox="0 0 10 7" xmlns="http://www.w3.org/2000/svg" className="size-4 stroke-current stroke-2 text-gray-500" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m1 1.444 4 3.791 4-3.79"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="col-start-3 flex flex-col gap-4 content-start text-sm font-medium">
            <div className="flex flex-col gap-2">
              <span className="col-start-1">Retrofits available</span>
              <ul className="col-start-2 flex flex-row rounded-lg border border-gray-200 divide-x">
                <li className="flex flex-1 flex-row gap-2 items-center p-3">
                  <button className="contents">
                    <div className="size-4 rounded-full focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 group-focus:ring-primary-500 dark:group-focus:ring-primary-600 group-focus:ring-2 flex items-center justify-center ring-offset-2 text-primary-600 bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:border-gray-600" role="radio" aria-checked="false"></div>
                    Yes
                  </button>
                </li>
                <li className="flex flex-1 flex-row gap-2 items-center p-3">
                  <button className="contents">
                    <div className="size-4 rounded-full focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 group-focus:ring-primary-500 dark:group-focus:ring-primary-600 group-focus:ring-2 flex items-center justify-center ring-offset-2 text-primary-600 bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:border-gray-600" role="radio" aria-checked="false"></div>
                    No
                  </button>
                </li>
                <li className="flex flex-1 flex-row gap-2 items-center p-3">
                  <button className="contents">
                    <div className="size-4 rounded-full focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 group-focus:ring-primary-500 dark:group-focus:ring-primary-600 group-focus:ring-2 flex items-center justify-center ring-offset-2 text-white bg-primary-600 dark:bg-gray-700" role="radio" aria-checked="true">
                      <div className="bg-white rounded-full size-1.5"></div>
                    </div>
                    Either
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[316px_1fr] gap-4 items-end px-4 py-8">
          <div className="text-xl inline-flex items-center gap-x-1 flex-row flex-wrap proportional-nums font-medium col-start-1 row-start-1 h-12">
            <span className="font-semibold text-blue-900">1,560</span> units in <span className="font-semibold text-blue-900">1,120</span> buildings
          </div>
          <div className="text-xl inline-flex items-center gap-x-1 flex-row flex-wrap proportional-nums font-medium col-start-1 row-start-2 h-12">
            <span className="font-semibold text-blue-900">867k</span> sqm
          </div>
          <div className="text-xl inline-flex items-center gap-x-1 flex-row flex-wrap proportional-nums font-medium col-start-1 row-start-3 h-12">
            <span className="font-semibold text-blue-900">£92m</span> rateable value
          </div>
          <div className="text-base font-medium col-start-2 row-start-1">
            Number of units by rating (commercial only)
            <div className="relative h-12 bg-gray-100 rounded-lg mt-2 flex items-center justify-center text-gray-500">
              Chart visualization area
            </div>
          </div>
          <div className="text-base font-medium col-start-2 row-start-2">
            Floor space by rating (commercial only)
            <div className="relative h-12 bg-gray-100 rounded-lg mt-2 flex items-center justify-center text-gray-500">
              Chart visualization area
            </div>
          </div>
          <div className="text-base font-medium col-start-2 row-start-3">
            Rateable value by rating (commercial only)
            <div className="relative h-12 bg-gray-100 rounded-lg mt-2 flex items-center justify-center text-gray-500">
              Chart visualization area
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
