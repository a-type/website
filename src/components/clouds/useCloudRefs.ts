import { RefObject, useEffect, useRef, useState } from 'react';
import create from 'zustand';
import { combine } from 'zustand/middleware';

export const useCloudRefs = create(
  combine({ refs: new Array<any>() }, (set) => ({
    add: (item: any) => {
      if (!item) return;
      set((state) => ({
        refs: [...state.refs, { current: item }],
      }));
    },
    remove: (item: any) => {
      set((state) => ({
        refs: state.refs.filter((ref) => ref.current !== item),
      }));
    },
  })),
);

export const useCloudRef = () => {
  const [item, setItem] = useState<any>(null);

  const { add, remove } = useCloudRefs();
  useEffect(() => {
    if (item) {
      add(item);
    }
    return () => {
      remove(item);
    };
  }, [item]);
  return setItem;
};
