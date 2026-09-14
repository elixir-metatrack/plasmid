"use client";

import type { RowSelectionState } from "@tanstack/react-table";
import { create } from "zustand";

import type { Sample } from "@/components/samples/columns";

export type SampleSelectionState = {
  isInitialized: boolean;
  selectedSampleIds: RowSelectionState;
  selectedSamples: Sample[];
  registerSamples: (samples: Sample[]) => void;
  setSelectedSampleIds: (selectedSampleIds: RowSelectionState) => void;
  toggleSample: (sampleId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  clearSelection: () => void;
};

let samplesById: Record<string, Sample> = {};

function getSelectedSamples(selectedSampleIds: RowSelectionState) {
  return Object.keys(selectedSampleIds)
    .filter((sampleId) => selectedSampleIds[sampleId])
    .map((sampleId) => samplesById[sampleId])
    .filter((sample): sample is Sample => sample !== undefined);
}

export const useSampleSelectionStore = create<SampleSelectionState>()(
  (set) => ({
    isInitialized: false,
    selectedSampleIds: {},
    selectedSamples: [],
    registerSamples: (samples) => {
      set((state) => {
        if (!state.isInitialized) {
          samplesById = Object.fromEntries(
            samples.map((sample) => [sample.id, sample]),
          );
          const selectedSampleIds: RowSelectionState = Object.fromEntries(
            samples.map((sample) => [sample.id, true]),
          );
          return {
            isInitialized: true,
            selectedSampleIds,
            selectedSamples: samples,
          };
        }

        const prevSamplesById = samplesById;
        samplesById = Object.fromEntries(
          samples.map((sample) => [sample.id, sample]),
        );

        const nextSelectedSampleIds: RowSelectionState = {};
        for (const sample of samples) {
          if (sample.id in prevSamplesById) {
            if (state.selectedSampleIds[sample.id]) {
              nextSelectedSampleIds[sample.id] = true;
            }
          } else {
            nextSelectedSampleIds[sample.id] = true;
          }
        }

        return {
          selectedSampleIds: nextSelectedSampleIds,
          selectedSamples: getSelectedSamples(nextSelectedSampleIds),
        };
      });
    },
    setSelectedSampleIds: (selectedSampleIds) =>
      set({
        selectedSampleIds,
        selectedSamples: getSelectedSamples(selectedSampleIds),
      }),
    toggleSample: (sampleId) =>
      set((state) => {
        const selectedSampleIds = { ...state.selectedSampleIds };
        if (selectedSampleIds[sampleId]) {
          delete selectedSampleIds[sampleId];
        } else {
          selectedSampleIds[sampleId] = true;
        }
        return {
          selectedSampleIds,
          selectedSamples: getSelectedSamples(selectedSampleIds),
        };
      }),
    selectAll: () =>
      set(() => {
        const selectedSampleIds: RowSelectionState = Object.fromEntries(
          Object.keys(samplesById).map((id) => [id, true]),
        );
        return {
          selectedSampleIds,
          selectedSamples: getSelectedSamples(selectedSampleIds),
        };
      }),
    deselectAll: () => set({ selectedSampleIds: {}, selectedSamples: [] }),
    clearSelection: () => set({ selectedSampleIds: {}, selectedSamples: [] }),
  }),
);
