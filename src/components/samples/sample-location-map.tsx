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
                <div className="bg-primary size-4 rounded-full border-2 border-white shadow-lg" />
              </MarkerContent>
              <MarkerContent>{sample.alias}</MarkerContent>
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
