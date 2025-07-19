// /components/DropZoneList.tsx
import React, { useMemo } from 'react';
import DropZone from './DropZone';

interface Props {
  count: number;
}

const DropZoneList = ({ count }: Props) => {
  const renderedZones = useMemo(() => {
    return Array.from({ length: count }).map((_, index) => (
      <DropZone key={index} index={index} />
    ));
  }, [count]);

  return <>{renderedZones}</>;
};

export default React.memo(DropZoneList);