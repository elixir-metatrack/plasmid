"use client";

import { Card } from "@/components/ui/card";
import {
  // biome-ignore lint/suspicious/noShadowRestrictedNames: <Map here only refers to the mapcn component>
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map";
import { useSampleSelectionStore } from "@/lib/sample-selection-store";

export function SampleLocationMap() {
  const selectedSamples = useSampleSelectionStore().selectedSamples;
  return (
    <Card className="h-120 p-0 overflow-hidden">
      <Map center={[-2, 67]} zoom={4}>
        {selectedSamples.map((sample) => {
          if (!sample.longitude || !sample.latitude) {
            return null;
          }
          return (
            <MapMarker
              key={sample.id}
              longitude={sample.longitude}
              latitude={sample.latitude}
            >
              <MarkerContent>
                <div className="relative flex size-7 items-center justify-center">
                  <div className="bg-primary absolute top-4 size-3 rotate-45 rounded-xs shadow-sm" />
                  <div className="bg-background relative flex size-6 items-center justify-center rounded-full border-2 border-primary shadow-md">
                    <div className="bg-primary size-2.5 rounded-full ring-2 ring-primary/20" />
                  </div>
                </div>
              </MarkerContent>
              <MarkerContent className="-mt-7 ml-9 max-w-44">
                <div className="bg-background/95 text-foreground truncate rounded-md border border-border px-2 py-1 text-xs font-medium shadow-sm backdrop-blur-sm">
                  {sample.alias}
                </div>
              </MarkerContent>
              <MarkerPopup>
                <div className="space-y-1">
                  <p className="text-foreground font-medium">{sample.alias}</p>
                  <p className="text-muted-foreground text-xs">
                    ({sample.latitude.toFixed(4)}, {sample.longitude.toFixed(4)}
                    )
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {sample.locality}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {sample.source}
                  </p>
                  {sample.countryCode ? (
                    <p className="text-muted-foreground text-xs">
                      {sample.countryCode}
                    </p>
                  ) : null}
                  {sample.collectionDate ? (
                    <p className="text-muted-foreground text-xs">
                      {sample.collectionDate}
                    </p>
                  ) : null}
                </div>
              </MarkerPopup>
            </MapMarker>
          );
        })}
        <MapControls />
      </Map>
    </Card>
  );
}
