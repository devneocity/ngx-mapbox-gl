import { AfterContentInit, ChangeDetectorRef, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, NgZone, EventEmitter } from '@angular/core';
import { Cluster, Supercluster } from 'supercluster';
import { MapService } from '../map/map.service';
export declare class PointDirective {
}
export declare class ClusterPointDirective {
}
export declare class MarkerClusterComponent implements OnChanges, OnDestroy, AfterContentInit, OnInit {
    private MapService;
    private ChangeDetectorRef;
    private zone;
    radius?: number;
    maxZoom?: number;
    minZoom?: number;
    extent?: number;
    nodeSize?: number;
    log?: boolean;
    reduce?: (accumulated: any, props: any) => void;
    initial?: () => any;
    map?: (props: any) => any;
    data: GeoJSON.FeatureCollection<GeoJSON.Point>;
    load: EventEmitter<Supercluster>;
    pointTpl: TemplateRef<any>;
    clusterPointTpl: TemplateRef<any>;
    clusterPoints: GeoJSON.Feature<GeoJSON.Point>[];
    private supercluster;
    private sub;
    constructor(MapService: MapService, ChangeDetectorRef: ChangeDetectorRef, zone: NgZone);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    getLeavesFn: (feature: Cluster) => (limit?: number, offset?: number) => any;
    getChildrenFn: (feature: Cluster) => () => any;
    getClusterExpansionZoomFn: (feature: Cluster) => () => any;
    private updateCluster();
}
