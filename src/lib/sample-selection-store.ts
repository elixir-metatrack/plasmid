"use client";

import type { RowSelectionState } from "@tanstack/react-table";
import { create } from "zustand";

import type { Sample } from "@/components/samples/columns";

export type SampleSelectionState = {
  selectedSampleIds: RowSelectionState;
  selectedSamples: Sample[];
  registerSamples: (samples: Sample[]) => void;
  setSelectedSampleIds: (selectedSampleIds: RowSelectionState) => void;
  toggleSample: (sampleId: string) => void;
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
    selectedSampleIds: {},
    selectedSamples: [],
    registerSamples: (samples) => {
      samplesById = Object.fromEntries(
        samples.map((sample) => [sample.id, sample]),
      );
      set((state) => ({
        selectedSamples: getSelectedSamples(state.selectedSampleIds),
      }));
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
    clearSelection: () => set({ selectedSampleIds: {}, selectedSamples: [] }),
  }),
);
