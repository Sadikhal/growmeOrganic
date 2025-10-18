import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { ChevronDownIcon } from 'primereact/icons/chevrondown';
import { useSearchParams } from 'react-router-dom';
import type { Artwork, PaginationInfo, PageEvent } from '../types';
import { fetchArtworks as fetchArtworksAPI } from '../api/artworks';

const ArtworkTable: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [first, setFirst] = useState<number>(0);

  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [searchParams, setSearchParams] = useSearchParams();
  const opRef = useRef<OverlayPanel>(null);
  const [selectCount, setSelectCount] = useState<number | null>(null);

  // Fetch artworks data
  const fetchData = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchArtworksAPI(page);
      
      setArtworks(data.data);
      setPagination(data.pagination);
      setSearchParams({ page: page.toString() });

      // Maintain selection for current page as you mentioned
      const filteredSelected = data.data.filter((a) => selectedIds.has(a.id));
      setSelectedArtworks(filteredSelected);
    } catch (err) {
      setError('Failed to fetch artworks. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const pageParam = searchParams.get('page');
    const initialPage = pageParam ? parseInt(pageParam) : 1;
    if (initialPage < 1 || isNaN(initialPage)) {
      setSearchParams({ page: '1' });
      return;
    }
    setFirst((initialPage - 1) * (pagination?.limit ?? 12));
    fetchData(initialPage);
  }, [searchParams]);



  // Pagination handling
  const onPageChange = (event: PageEvent) => {
    const newPage = event.page + 1;
    setFirst(event.first);
    setSearchParams({ page: newPage.toString() });
  };

  // Selection change handling
  const handleSelectionChange = (e: any) => {
    const currentSelection: Artwork[] = e.value;
    const newSelectedIds = new Set(selectedIds);

    currentSelection.forEach((artwork) => newSelectedIds.add(artwork.id));

    artworks.forEach((artwork) => {
      const isSelectedNow = currentSelection.some((a) => a.id === artwork.id);
      if (!isSelectedNow) newSelectedIds.delete(artwork.id);
    });

    setSelectedIds(newSelectedIds);
    const filteredSelected = artworks.filter((a) => newSelectedIds.has(a.id));
    setSelectedArtworks(filteredSelected);
  };

  // Select first N number of artworks across pages
  const handleSelectFirstN = async () => {
    if (!selectCount || selectCount <= 0) return;

    const newSelectedIds = new Set<number>();
    let remaining = selectCount;
    let page = 1;

    try {
      setLoading(true);
      while (remaining > 0) {
        const data = await fetchArtworksAPI(page);
        data.data.forEach((artwork) => {
          if (remaining > 0) {
            newSelectedIds.add(artwork.id);
            remaining--;
          }
        });
        if (!data.pagination.next_url || data.data.length === 0) break;
        page++;
      }

      setSelectedIds(newSelectedIds);
      const filteredSelected = artworks.filter((a) => newSelectedIds.has(a.id));
      setSelectedArtworks(filteredSelected);

      opRef.current?.hide();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderTitleHeader = () => (
    <div className="flex items-center gap-2">
      <Button
        icon={<ChevronDownIcon />}
        rounded
        text
        onClick={(e) => opRef.current?.toggle(e)}
        tooltip="Select first N artworks"
        tooltipOptions={{ position: 'bottom' }}
      />
      <OverlayPanel ref={opRef}>
        <div className="flex flex-col gap-4 p-2 w-60">
          <InputNumber
            value={selectCount}
            onValueChange={(e) => setSelectCount(e.value ?? null)}
            placeholder="Enter number"
            className="w-full"
          />
          <Button
            label="Submit"
            onClick={handleSelectFirstN}
            disabled={!selectCount || selectCount <= 0}
            className="p-button-sm w-full mt-2"
          />
        </div>
      </OverlayPanel>
      <span>Title</span>
    </div>
  );

  if (error) {
    return (
      <div className="p-4">
        <Message severity="error" text={error} />
        <div className="mt-3">
          <Button
            label="Retry"
            className="p-button p-button-outlined"
            onClick={() => setSearchParams({ page: '1' })}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card title="Art Institute of Chicago - Artworks Collection" className="shadow-2">
        {loading && (
          <div className="flex justify-center py-4">
            <span className="ml-3">Loading artworks...</span>
          </div>
        )}

        <DataTable
          value={artworks}
          loading={loading}
          emptyMessage="No artworks found."
          className="p-datatable-sm"
          paginator={false}
          dataKey="id"
          selection={selectedArtworks}
          onSelectionChange={handleSelectionChange}
          selectionMode="checkbox"
          tableStyle={{ minWidth: '50rem' }}
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
          <Column field="title" header={renderTitleHeader()} style={{ minWidth: '250px' }} />
          <Column field="place_of_origin" header="Place of Origin" style={{ minWidth: '150px' }} />
          <Column field="artist_display" header="Artist Display" style={{ minWidth: '250px' }} />
          <Column field="inscriptions" header="Inscription" style={{ minWidth: '250px' }} body={(rowData) => rowData.inscriptions ?? 'No inscription'}/>
          <Column field="date_start" header="Date Start" style={{ minWidth: '100px' }} />
          <Column field="date_end" header="Date End" style={{ minWidth: '100px' }} />
        </DataTable>

        {pagination && (
          <div className="mt-4">
            <Paginator
              first={first}
              rows={pagination.limit}
              totalRecords={pagination.total}
              onPageChange={onPageChange}
              template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
              className="justify-content-start"
            />
            <div className="text-sm text-cyan-700 mt-2">
              Page {pagination.current_page} of {pagination.total_pages} • Total Records:{' '}
              {pagination.total}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ArtworkTable;
