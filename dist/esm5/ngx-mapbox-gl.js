import { __awaiter, __generator, __values } from 'tslib';
import { Inject, Injectable, InjectionToken, NgZone, Optional, ChangeDetectionStrategy, Component, Input, ViewChild, Directive, Host, EventEmitter, Output, ViewEncapsulation, forwardRef, ChangeDetectorRef, ContentChild, TemplateRef, NgModule } from '@angular/core';
import bbox from '@turf/bbox';
import { polygon } from '@turf/helpers';
import * as MapboxGl from 'mapbox-gl';
import { AttributionControl, FullscreenControl, GeolocateControl, NavigationControl, ScaleControl, Marker, Popup, Map } from 'mapbox-gl';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { first } from 'rxjs/operators/first';
import { Subscription } from 'rxjs/Subscription';
import { debounceTime } from 'rxjs/operators/debounceTime';
import { Subject } from 'rxjs/Subject';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { filter } from 'rxjs/operators/filter';
import { switchMap } from 'rxjs/operators/switchMap';
import { take } from 'rxjs/operators/take';
import { takeUntil } from 'rxjs/operators/takeUntil';
import { tap } from 'rxjs/operators/tap';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { merge } from 'rxjs/observable/merge';
import { startWith } from 'rxjs/operators/startWith';
import supercluster from 'supercluster';
import { CommonModule } from '@angular/common';

var MAPBOX_API_KEY = new InjectionToken('MapboxApiKey');
var MglResizeEventEmitter = /** @class */ (function () {
    function MglResizeEventEmitter() {
    }
    return MglResizeEventEmitter;
}());
var MapService = /** @class */ (function () {
    function MapService(zone, MAPBOX_API_KEY, MglResizeEventEmitter) {
        this.zone = zone;
        this.MAPBOX_API_KEY = MAPBOX_API_KEY;
        this.MglResizeEventEmitter = MglResizeEventEmitter;
        this.mapCreated = new AsyncSubject();
        this.mapLoaded = new AsyncSubject();
        this.layerIdsToRemove = [];
        this.sourceIdsToRemove = [];
        this.markersToRemove = [];
        this.popupsToRemove = [];
        this.imageIdsToRemove = [];
        this.subscription = new Subscription();
        this.mapCreated$ = this.mapCreated.asObservable();
        this.mapLoaded$ = this.mapLoaded.asObservable();
    }
    MapService.prototype.setup = function (options) {
        var _this = this;
        this.zone.onStable.pipe(first()).subscribe(function () {
            _this.assign(MapboxGl, 'accessToken', options.accessToken || _this.MAPBOX_API_KEY);
            if (options.customMapboxApiUrl) {
                _this.assign(MapboxGl, 'config.API_URL', options.customMapboxApiUrl);
            }
            _this.createMap(options.mapOptions);
            _this.hookEvents(options.mapEvents);
            _this.mapEvents = options.mapEvents;
            _this.mapCreated.next(undefined);
            _this.mapCreated.complete();
        });
    };
    MapService.prototype.destroyMap = function () {
        this.subscription.unsubscribe();
        this.mapInstance.remove();
    };
    MapService.prototype.updateMinZoom = function (minZoom) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            _this.mapInstance.setMinZoom(minZoom);
        });
    };
    MapService.prototype.updateMaxZoom = function (maxZoom) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            _this.mapInstance.setMaxZoom(maxZoom);
        });
    };
    MapService.prototype.updateScrollZoom = function (status) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            status ? _this.mapInstance.scrollZoom.enable() : _this.mapInstance.scrollZoom.disable();
        });
    };
    MapService.prototype.updateDragRotate = function (status) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            status ? _this.mapInstance.dragRotate.enable() : _this.mapInstance.dragRotate.disable();
        });
    };
    MapService.prototype.updateTouchZoomRotate = function (status) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            status ? _this.mapInstance.touchZoomRotate.enable() : _this.mapInstance.touchZoomRotate.disable();
        });
    };
    MapService.prototype.updateDoubleClickZoom = function (status) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            status ? _this.mapInstance.doubleClickZoom.enable() : _this.mapInstance.doubleClickZoom.disable();
        });
    };
    MapService.prototype.updateKeyboard = function (status) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            status ? _this.mapInstance.keyboard.enable() : _this.mapInstance.keyboard.disable();
        });
    };
    MapService.prototype.updateDragPan = function (status) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            status ? _this.mapInstance.dragPan.enable() : _this.mapInstance.dragPan.disable();
        });
    };
    MapService.prototype.updateBoxZoom = function (status) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            status ? _this.mapInstance.boxZoom.enable() : _this.mapInstance.boxZoom.disable();
        });
    };
    MapService.prototype.updateStyle = function (style) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            _this.mapInstance.setStyle(style);
        });
    };
    MapService.prototype.updateMaxBounds = function (maxBounds) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            _this.mapInstance.setMaxBounds(maxBounds);
        });
    };
    MapService.prototype.changeCanvasCursor = function (cursor) {
        var canvas = this.mapInstance.getCanvasContainer();
        canvas.style.cursor = cursor;
    };
    MapService.prototype.queryRenderedFeatures = function (pointOrBox, parameters) {
        return this.mapInstance.queryRenderedFeatures(pointOrBox, parameters);
    };
    MapService.prototype.panTo = function (center, options) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            _this.mapInstance.panTo(center, options);
        });
    };
    MapService.prototype.move = function (movingMethod, movingOptions, zoom, center, bearing, pitch) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            ((_this.mapInstance[movingMethod]))(Object.assign({}, movingOptions, { zoom: zoom ? zoom : _this.mapInstance.getZoom(), center: center ? center : _this.mapInstance.getCenter(), bearing: bearing ? bearing : _this.mapInstance.getBearing(), pitch: pitch ? pitch : _this.mapInstance.getPitch() }));
        });
    };
    MapService.prototype.addLayer = function (layer, before) {
        var _this = this;
        this.zone.runOutsideAngular(function () {
            Object.keys(layer.layerOptions)
                .forEach(function (key) {
                var tkey = (key);
                if (layer.layerOptions[tkey] === undefined) {
                    delete layer.layerOptions[tkey];
                }
            });
            _this.mapInstance.addLayer(layer.layerOptions, before);
            if (layer.layerEvents.click.observers.length) {
                _this.mapInstance.on('click', layer.layerOptions.id, function (evt) {
                    _this.zone.run(function () {
                        layer.layerEvents.click.emit(evt);
                    });
                });
            }
            if (layer.layerEvents.mouseEnter.observers.length) {
                _this.mapInstance.on('mouseenter', layer.layerOptions.id, function (evt) {
                    _this.zone.run(function () {
                        layer.layerEvents.mouseEnter.emit(evt);
                    });
                });
            }
            if (layer.layerEvents.mouseLeave.observers.length) {
                _this.mapInstance.on('mouseleave', layer.layerOptions.id, function (evt) {
                    _this.zone.run(function () {
                        layer.layerEvents.mouseLeave.emit(evt);
                    });
                });
            }
            if (layer.layerEvents.mouseMove.observers.length) {
                _this.mapInstance.on('mousemove', layer.layerOptions.id, function (evt) {
                    _this.zone.run(function () {
                        layer.layerEvents.mouseMove.emit(evt);
                    });
                });
            }
        });
    };
    MapService.prototype.removeLayer = function (layerId) {
        this.layerIdsToRemove.push(layerId);
    };
    MapService.prototype.addMarker = function (marker) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            marker.addTo(_this.mapInstance);
        });
    };
    MapService.prototype.removeMarker = function (marker) {
        this.markersToRemove.push(marker);
    };
    MapService.prototype.createPopup = function (popup, element) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            Object.keys(popup.popupOptions)
                .forEach(function (key) { return ((popup.popupOptions))[key] === undefined && delete ((popup.popupOptions))[key]; });
            var popupInstance = new Popup(popup.popupOptions);
            popupInstance.setDOMContent(element);
            if (popup.popupEvents.close.observers.length) {
                popupInstance.on('close', function () {
                    _this.zone.run(function () {
                        popup.popupEvents.close.emit();
                    });
                });
            }
            if (popup.popupEvents.open.observers.length) {
                popupInstance.on('open', function () {
                    _this.zone.run(function () {
                        popup.popupEvents.open.emit();
                    });
                });
            }
            return popupInstance;
        });
    };
    MapService.prototype.addPopupToMap = function (popup, lngLat) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            popup.setLngLat(lngLat);
            popup.addTo(_this.mapInstance);
        });
    };
    MapService.prototype.addPopupToMarker = function (marker, popup) {
        return this.zone.runOutsideAngular(function () {
            marker.setPopup(popup);
        });
    };
    MapService.prototype.removePopupFromMap = function (popup) {
        this.popupsToRemove.push(popup);
    };
    MapService.prototype.removePopupFromMarker = function (marker) {
        return this.zone.runOutsideAngular(function () {
            marker.setPopup(undefined);
        });
    };
    MapService.prototype.addControl = function (control, position) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            _this.mapInstance.addControl((control), position);
        });
    };
    MapService.prototype.removeControl = function (control) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            _this.mapInstance.removeControl((control));
        });
    };
    MapService.prototype.loadAndAddImage = function (imageId, url, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.zone.runOutsideAngular(function () {
                        return new Promise(function (resolve, reject) {
                            _this.mapInstance.loadImage(url, function (error, image) {
                                if (error) {
                                    reject(error);
                                    return;
                                }
                                _this.addImage(imageId, image, options);
                                resolve();
                            });
                        });
                    })];
            });
        });
    };
    MapService.prototype.addImage = function (imageId, data, options) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            _this.mapInstance.addImage(imageId, (data), options);
        });
    };
    MapService.prototype.removeImage = function (imageId) {
        this.imageIdsToRemove.push(imageId);
    };
    MapService.prototype.addSource = function (sourceId, source) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            Object.keys(source)
                .forEach(function (key) { return ((source))[key] === undefined && delete ((source))[key]; });
            _this.mapInstance.addSource(sourceId, (source));
        });
    };
    MapService.prototype.getSource = function (sourceId) {
        return ((this.mapInstance.getSource(sourceId)));
    };
    MapService.prototype.removeSource = function (sourceId) {
        this.sourceIdsToRemove.push(sourceId);
    };
    MapService.prototype.setAllLayerPaintProperty = function (layerId, paint) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            Object.keys(paint).forEach(function (key) {
                _this.mapInstance.setPaintProperty(layerId, key, ((paint))[key]);
            });
        });
    };
    MapService.prototype.setAllLayerLayoutProperty = function (layerId, layout) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            Object.keys(layout).forEach(function (key) {
                _this.mapInstance.setLayoutProperty(layerId, key, ((layout))[key]);
            });
        });
    };
    MapService.prototype.setLayerFilter = function (layerId, filter$$1) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            _this.mapInstance.setFilter(layerId, filter$$1);
        });
    };
    MapService.prototype.setLayerBefore = function (layerId, beforeId) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            _this.mapInstance.moveLayer(layerId, beforeId);
        });
    };
    MapService.prototype.setLayerZoomRange = function (layerId, minZoom, maxZoom) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            _this.mapInstance.setLayerZoomRange(layerId, minZoom ? minZoom : 0, maxZoom ? maxZoom : 20);
        });
    };
    MapService.prototype.fitBounds = function (bounds, options) {
        var _this = this;
        return this.zone.runOutsideAngular(function () {
            _this.mapInstance.fitBounds(bounds, options);
        });
    };
    MapService.prototype.getCurrentViewportBbox = function () {
        var canvas = this.mapInstance.getCanvas();
        var w = canvas.width;
        var h = canvas.height;
        var upLeft = this.mapInstance.unproject([0, 0]).toArray();
        var upRight = this.mapInstance.unproject([w, 0]).toArray();
        var downRight = this.mapInstance.unproject([w, h]).toArray();
        var downLeft = this.mapInstance.unproject([0, h]).toArray();
        return bbox(polygon([[upLeft, upRight, downRight, downLeft, upLeft]]));
    };
    MapService.prototype.applyChanges = function () {
        var _this = this;
        this.zone.runOutsideAngular(function () {
            _this.removeLayers();
            _this.removeSources();
            _this.removeMarkers();
            _this.removePopups();
            _this.removeImages();
        });
    };
    MapService.prototype.createMap = function (options) {
        var _this = this;
        NgZone.assertNotInAngularZone();
        Object.keys(options)
            .forEach(function (key) {
            var tkey = (key);
            if (options[tkey] === undefined) {
                delete options[tkey];
            }
        });
        this.mapInstance = new Map(options);
        var subChanges = this.zone.onMicrotaskEmpty
            .subscribe(function () { return _this.applyChanges(); });
        if (this.MglResizeEventEmitter) {
            var subResize = this.MglResizeEventEmitter.resizeEvent.subscribe(function () {
                _this.mapInstance.resize();
            });
            this.subscription.add(subResize);
        }
        this.subscription.add(subChanges);
    };
    MapService.prototype.removeLayers = function () {
        try {
            for (var _a = __values(this.layerIdsToRemove), _b = _a.next(); !_b.done; _b = _a.next()) {
                var layerId = _b.value;
                this.mapInstance.off('click', layerId);
                this.mapInstance.off('mouseenter', layerId);
                this.mapInstance.off('mouseleave', layerId);
                this.mapInstance.off('mousemove', layerId);
                this.mapInstance.removeLayer(layerId);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.layerIdsToRemove = [];
        var e_1, _c;
    };
    MapService.prototype.removeSources = function () {
        try {
            for (var _a = __values(this.sourceIdsToRemove), _b = _a.next(); !_b.done; _b = _a.next()) {
                var sourceId = _b.value;
                this.mapInstance.removeSource(sourceId);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_2) throw e_2.error; }
        }
        this.sourceIdsToRemove = [];
        var e_2, _c;
    };
    MapService.prototype.removeMarkers = function () {
        try {
            for (var _a = __values(this.markersToRemove), _b = _a.next(); !_b.done; _b = _a.next()) {
                var marker = _b.value;
                marker.remove();
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_3) throw e_3.error; }
        }
        this.markersToRemove = [];
        var e_3, _c;
    };
    MapService.prototype.removePopups = function () {
        try {
            for (var _a = __values(this.popupsToRemove), _b = _a.next(); !_b.done; _b = _a.next()) {
                var popup = _b.value;
                popup.remove();
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_4) throw e_4.error; }
        }
        this.popupsToRemove = [];
        var e_4, _c;
    };
    MapService.prototype.removeImages = function () {
        try {
            for (var _a = __values(this.imageIdsToRemove), _b = _a.next(); !_b.done; _b = _a.next()) {
                var imageId = _b.value;
                this.mapInstance.removeImage(imageId);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_5) throw e_5.error; }
        }
        this.imageIdsToRemove = [];
        var e_5, _c;
    };
    MapService.prototype.hookEvents = function (events) {
        var _this = this;
        this.mapInstance.on('load', function () {
            _this.mapLoaded.next(undefined);
            _this.mapLoaded.complete();
            _this.zone.run(function () { return events.load.emit(_this.mapInstance); });
        });
        if (events.resize.observers.length) {
            this.mapInstance.on('resize', function () { return _this.zone.run(function () { return events.resize.emit(); }); });
        }
        if (events.remove.observers.length) {
            this.mapInstance.on('remove', function () { return _this.zone.run(function () { return events.remove.emit(); }); });
        }
        if (events.mouseDown.observers.length) {
            this.mapInstance.on('mousedown', function (evt) { return _this.zone.run(function () { return events.mouseDown.emit(evt); }); });
        }
        if (events.mouseUp.observers.length) {
            this.mapInstance.on('mouseup', function (evt) { return _this.zone.run(function () { return events.mouseUp.emit(evt); }); });
        }
        if (events.mouseMove.observers.length) {
            this.mapInstance.on('mousemove', function (evt) { return _this.zone.run(function () { return events.mouseMove.emit(evt); }); });
        }
        if (events.click.observers.length) {
            this.mapInstance.on('click', function (evt) { return _this.zone.run(function () { return events.click.emit(evt); }); });
        }
        if (events.dblClick.observers.length) {
            this.mapInstance.on('dblclick', function (evt) { return _this.zone.run(function () { return events.dblClick.emit(evt); }); });
        }
        if (events.mouseEnter.observers.length) {
            this.mapInstance.on('mouseenter', function (evt) { return _this.zone.run(function () { return events.mouseEnter.emit(evt); }); });
        }
        if (events.mouseLeave.observers.length) {
            this.mapInstance.on('mouseleave', function (evt) { return _this.zone.run(function () { return events.mouseLeave.emit(evt); }); });
        }
        if (events.mouseOver.observers.length) {
            this.mapInstance.on('mouseover', function (evt) { return _this.zone.run(function () { return events.mouseOver.emit(evt); }); });
        }
        if (events.mouseOut.observers.length) {
            this.mapInstance.on('mouseout', function (evt) { return _this.zone.run(function () { return events.mouseOut.emit(evt); }); });
        }
        if (events.contextMenu.observers.length) {
            this.mapInstance.on('contextmenu', function (evt) { return _this.zone.run(function () { return events.contextMenu.emit(evt); }); });
        }
        if (events.touchStart.observers.length) {
            this.mapInstance.on('touchstart', function (evt) { return _this.zone.run(function () { return events.touchStart.emit(evt); }); });
        }
        if (events.touchEnd.observers.length) {
            this.mapInstance.on('touchend', function (evt) { return _this.zone.run(function () { return events.touchEnd.emit(evt); }); });
        }
        if (events.touchMove.observers.length) {
            this.mapInstance.on('touchmove', function (evt) { return _this.zone.run(function () { return events.touchMove.emit(evt); }); });
        }
        if (events.touchCancel.observers.length) {
            this.mapInstance.on('touchcancel', function (evt) { return _this.zone.run(function () { return events.touchCancel.emit(evt); }); });
        }
        if (events.wheel.observers.length) {
            this.mapInstance.on('wheel', function (evt) { return _this.zone.run(function () { return events.wheel.emit(evt); }); });
        }
        if (events.moveStart.observers.length) {
            this.mapInstance.on('movestart', function (evt) { return _this.zone.run(function () { return events.moveStart.emit(evt); }); });
        }
        if (events.move.observers.length) {
            this.mapInstance.on('move', function (evt) { return _this.zone.run(function () { return events.move.emit(evt); }); });
        }
        if (events.moveEnd.observers.length) {
            this.mapInstance.on('moveend', function (evt) { return _this.zone.run(function () { return events.moveEnd.emit(evt); }); });
        }
        if (events.dragStart.observers.length) {
            this.mapInstance.on('dragstart', function (evt) { return _this.zone.run(function () { return events.dragStart.emit(evt); }); });
        }
        if (events.drag.observers.length) {
            this.mapInstance.on('drag', function (evt) { return _this.zone.run(function () { return events.drag.emit(evt); }); });
        }
        if (events.dragEnd.observers.length) {
            this.mapInstance.on('dragend', function (evt) { return _this.zone.run(function () { return events.dragEnd.emit(evt); }); });
        }
        if (events.zoomStart.observers.length) {
            this.mapInstance.on('zoomstart', function (evt) { return _this.zone.run(function () { return events.zoomStart.emit(evt); }); });
        }
        if (events.zoomEvt.observers.length) {
            this.mapInstance.on('zoom', function (evt) { return _this.zone.run(function () { return events.zoomEvt.emit(evt); }); });
        }
        if (events.zoomEnd.observers.length) {
            this.mapInstance.on('zoomend', function (evt) { return _this.zone.run(function () { return events.zoomEnd.emit(evt); }); });
        }
        if (events.rotateStart.observers.length) {
            this.mapInstance.on('rotatestart', function (evt) { return _this.zone.run(function () { return events.rotateStart.emit(evt); }); });
        }
        if (events.rotate.observers.length) {
            this.mapInstance.on('rotate', function (evt) { return _this.zone.run(function () { return events.rotate.emit(evt); }); });
        }
        if (events.rotateEnd.observers.length) {
            this.mapInstance.on('rotateend', function (evt) { return _this.zone.run(function () { return events.rotateEnd.emit(evt); }); });
        }
        if (events.pitchStart.observers.length) {
            this.mapInstance.on('pitchstart', function (evt) { return _this.zone.run(function () { return events.pitchStart.emit(evt); }); });
        }
        if (events.pitchEvt.observers.length) {
            this.mapInstance.on('pitch', function (evt) { return _this.zone.run(function () { return events.pitchEvt.emit(evt); }); });
        }
        if (events.pitchEnd.observers.length) {
            this.mapInstance.on('pitchend', function (evt) { return _this.zone.run(function () { return events.pitchEnd.emit(evt); }); });
        }
        if (events.boxZoomStart.observers.length) {
            this.mapInstance.on('boxzoomstart', function (evt) { return _this.zone.run(function () { return events.boxZoomStart.emit(evt); }); });
        }
        if (events.boxZoomEnd.observers.length) {
            this.mapInstance.on('boxzoomend', function (evt) { return _this.zone.run(function () { return events.boxZoomEnd.emit(evt); }); });
        }
        if (events.boxZoomCancel.observers.length) {
            this.mapInstance.on('boxzoomcancel', function (evt) { return _this.zone.run(function () { return events.boxZoomCancel.emit(evt); }); });
        }
        if (events.webGlContextLost.observers.length) {
            this.mapInstance.on('webglcontextlost', function () { return _this.zone.run(function () { return events.webGlContextLost.emit(); }); });
        }
        if (events.webGlContextRestored.observers.length) {
            this.mapInstance.on('webglcontextrestored', function () { return _this.zone.run(function () { return events.webGlContextRestored.emit(); }); });
        }
        if (events.render.observers.length) {
            this.mapInstance.on('render', function () { return _this.zone.run(function () { return events.render.emit(); }); });
        }
        if (events.error.observers.length) {
            this.mapInstance.on('error', function () { return _this.zone.run(function () { return events.error.emit(); }); });
        }
        if (events.data.observers.length) {
            this.mapInstance.on('data', function (evt) { return _this.zone.run(function () { return events.data.emit(evt); }); });
        }
        if (events.styleData.observers.length) {
            this.mapInstance.on('styledata', function (evt) { return _this.zone.run(function () { return events.styleData.emit(evt); }); });
        }
        if (events.sourceData.observers.length) {
            this.mapInstance.on('sourcedata', function (evt) { return _this.zone.run(function () { return events.sourceData.emit(evt); }); });
        }
        if (events.dataLoading.observers.length) {
            this.mapInstance.on('dataloading', function (evt) { return _this.zone.run(function () { return events.dataLoading.emit(evt); }); });
        }
        if (events.styleDataLoading.observers.length) {
            this.mapInstance.on('styledataloading', function (evt) { return _this.zone.run(function () { return events.styleDataLoading.emit(evt); }); });
        }
        if (events.sourceDataLoading.observers.length) {
            this.mapInstance.on('sourcedataloading', function (evt) { return _this.zone.run(function () { return events.sourceDataLoading.emit(evt); }); });
        }
    };
    MapService.prototype.assign = function (obj, prop, value) {
        if (typeof prop === 'string') {
            prop = prop.split('.');
        }
        if (prop.length > 1) {
            var e = prop.shift();
            this.assign(obj[e] =
                Object.prototype.toString.call(obj[e]) === '[object Object]'
                    ? obj[e]
                    : {}, prop, value);
        }
        else {
            obj[prop[0]] = value;
        }
    };
    return MapService;
}());
MapService.decorators = [
    { type: Injectable },
];
MapService.ctorParameters = function () { return [
    { type: NgZone, },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [MAPBOX_API_KEY,] },] },
    { type: MglResizeEventEmitter, decorators: [{ type: Optional },] },
]; };
var CustomControl = /** @class */ (function () {
    function CustomControl(container) {
        this.container = container;
    }
    CustomControl.prototype.onAdd = function () {
        return this.container;
    };
    CustomControl.prototype.onRemove = function () {
        return ((this.container.parentNode)).removeChild(this.container);
    };
    CustomControl.prototype.getDefaultPosition = function () {
        return 'top-right';
    };
    return CustomControl;
}());
var ControlComponent = /** @class */ (function () {
    function ControlComponent(MapService$$1) {
        this.MapService = MapService$$1;
    }
    ControlComponent.prototype.ngAfterContentInit = function () {
        var _this = this;
        if (this.content.nativeElement.childNodes.length) {
            this.control = new CustomControl(this.content.nativeElement);
            this.MapService.mapCreated$.subscribe(function () {
                _this.MapService.addControl(((_this.control)), _this.position);
            });
        }
    };
    ControlComponent.prototype.ngOnDestroy = function () {
        this.MapService.removeControl(this.control);
    };
    return ControlComponent;
}());
ControlComponent.decorators = [
    { type: Component, args: [{
                selector: 'mgl-control',
                template: '<div class="mapboxgl-ctrl" #content><ng-content></ng-content></div>',
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
ControlComponent.ctorParameters = function () { return [
    { type: MapService, },
]; };
ControlComponent.propDecorators = {
    "position": [{ type: Input },],
    "content": [{ type: ViewChild, args: ['content',] },],
};
var AttributionControlDirective = /** @class */ (function () {
    function AttributionControlDirective(MapService$$1, ControlComponent$$1) {
        this.MapService = MapService$$1;
        this.ControlComponent = ControlComponent$$1;
    }
    AttributionControlDirective.prototype.ngOnInit = function () {
        var _this = this;
        this.MapService.mapCreated$.subscribe(function () {
            if (_this.ControlComponent.control) {
                throw new Error('Another control is already set for this control');
            }
            var options = {};
            if (_this.compact !== undefined) {
                options.compact = _this.compact;
            }
            _this.ControlComponent.control = new AttributionControl(options);
            _this.MapService.addControl(_this.ControlComponent.control, _this.ControlComponent.position);
        });
    };
    return AttributionControlDirective;
}());
AttributionControlDirective.decorators = [
    { type: Directive, args: [{
                selector: '[mglAttribution]'
            },] },
];
AttributionControlDirective.ctorParameters = function () { return [
    { type: MapService, },
    { type: ControlComponent, decorators: [{ type: Host },] },
]; };
AttributionControlDirective.propDecorators = {
    "compact": [{ type: Input },],
};
var FullscreenControlDirective = /** @class */ (function () {
    function FullscreenControlDirective(MapService$$1, ControlComponent$$1) {
        this.MapService = MapService$$1;
        this.ControlComponent = ControlComponent$$1;
    }
    FullscreenControlDirective.prototype.ngOnInit = function () {
        var _this = this;
        this.MapService.mapCreated$.subscribe(function () {
            if (_this.ControlComponent.control) {
                throw new Error('Another control is already set for this control');
            }
            _this.ControlComponent.control = new FullscreenControl();
            _this.MapService.addControl(_this.ControlComponent.control, _this.ControlComponent.position);
        });
    };
    return FullscreenControlDirective;
}());
FullscreenControlDirective.decorators = [
    { type: Directive, args: [{
                selector: '[mglFullscreen]'
            },] },
];
FullscreenControlDirective.ctorParameters = function () { return [
    { type: MapService, },
    { type: ControlComponent, decorators: [{ type: Host },] },
]; };
var MapboxGeocoder = require('@mapbox/mapbox-gl-geocoder');
var MAPBOX_GEOCODER_API_KEY = new InjectionToken('MapboxApiKey');
var GeocoderControlDirective = /** @class */ (function () {
    function GeocoderControlDirective(MapService$$1, zone, ControlComponent$$1, MAPBOX_GEOCODER_API_KEY) {
        this.MapService = MapService$$1;
        this.zone = zone;
        this.ControlComponent = ControlComponent$$1;
        this.MAPBOX_GEOCODER_API_KEY = MAPBOX_GEOCODER_API_KEY;
        this.clear = new EventEmitter();
        this.loading = new EventEmitter();
        this.results = new EventEmitter();
        this.result = new EventEmitter();
        this.error = new EventEmitter();
    }
    GeocoderControlDirective.prototype.ngOnInit = function () {
        var _this = this;
        this.MapService.mapCreated$.subscribe(function () {
            if (_this.ControlComponent.control) {
                throw new Error('Another control is already set for this control');
            }
            var options = {
                proximity: _this.proximity,
                country: _this.country,
                placeholder: _this.placeholder,
                zoom: _this.zoom,
                bbox: _this.bbox,
                types: _this.types,
                flyTo: _this.flyTo,
                minLength: _this.minLength,
                limit: _this.limit,
                language: _this.language,
                filter: _this.filter,
                localGeocoder: _this.localGeocoder,
                accessToken: _this.accessToken || _this.MAPBOX_GEOCODER_API_KEY
            };
            Object.keys(options).forEach(function (key) {
                var tkey = (key);
                if (options[tkey] === undefined) {
                    delete options[tkey];
                }
            });
            _this.geocoder = new MapboxGeocoder(options);
            _this.hookEvents(_this);
            _this.addControl();
        });
        if (this.searchInput) {
            this.MapService.mapLoaded$.subscribe(function () {
                _this.geocoder.query(_this.searchInput);
            });
        }
    };
    GeocoderControlDirective.prototype.ngOnChanges = function (changes) {
        if (!this.geocoder) {
            return;
        }
        if (changes["proximity"] && !changes["proximity"].isFirstChange()) {
            this.geocoder.setProximity(changes["proximity"].currentValue);
        }
        if (changes["searchInput"]) {
            this.geocoder.query(this.searchInput);
        }
    };
    GeocoderControlDirective.prototype.addControl = function () {
        this.ControlComponent.control = this.geocoder;
        this.MapService.addControl(this.ControlComponent.control, this.ControlComponent.position);
    };
    GeocoderControlDirective.prototype.hookEvents = function (events) {
        var _this = this;
        if (events.results.observers.length) {
            this.geocoder.on('results', function (evt) { return _this.zone.run(function () { return events.results.emit(evt); }); });
        }
        if (events.result.observers.length) {
            this.geocoder.on('result', function (evt) { return _this.zone.run(function () { return events.result.emit(evt); }); });
        }
        if (events.error.observers.length) {
            this.geocoder.on('error', function (evt) { return _this.zone.run(function () { return events.error.emit(evt); }); });
        }
        if (events.loading.observers.length) {
            this.geocoder.on('loading', function (evt) { return _this.zone.run(function () { return events.loading.emit(evt); }); });
        }
        if (events.clear.observers.length) {
            this.geocoder.on('clear', function () { return _this.zone.run(function () { return events.clear.emit(); }); });
        }
    };
    return GeocoderControlDirective;
}());
GeocoderControlDirective.decorators = [
    { type: Directive, args: [{
                selector: '[mglGeocoder]'
            },] },
];
GeocoderControlDirective.ctorParameters = function () { return [
    { type: MapService, },
    { type: NgZone, },
    { type: ControlComponent, decorators: [{ type: Host },] },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [MAPBOX_GEOCODER_API_KEY,] },] },
]; };
GeocoderControlDirective.propDecorators = {
    "country": [{ type: Input },],
    "placeholder": [{ type: Input },],
    "zoom": [{ type: Input },],
    "bbox": [{ type: Input },],
    "types": [{ type: Input },],
    "flyTo": [{ type: Input },],
    "minLength": [{ type: Input },],
    "limit": [{ type: Input },],
    "language": [{ type: Input },],
    "accessToken": [{ type: Input },],
    "filter": [{ type: Input },],
    "localGeocoder": [{ type: Input },],
    "proximity": [{ type: Input },],
    "searchInput": [{ type: Input },],
    "clear": [{ type: Output },],
    "loading": [{ type: Output },],
    "results": [{ type: Output },],
    "result": [{ type: Output },],
    "error": [{ type: Output },],
};
var GeolocateControlDirective = /** @class */ (function () {
    function GeolocateControlDirective(MapService$$1, ControlComponent$$1) {
        this.MapService = MapService$$1;
        this.ControlComponent = ControlComponent$$1;
    }
    GeolocateControlDirective.prototype.ngOnInit = function () {
        var _this = this;
        this.MapService.mapCreated$.subscribe(function () {
            if (_this.ControlComponent.control) {
                throw new Error('Another control is already set for this control');
            }
            var options = {
                positionOptions: _this.positionOptions,
                fitBoundsOptions: _this.fitBoundsOptions,
                trackUserLocation: _this.trackUserLocation,
                showUserLocation: _this.showUserLocation
            };
            Object.keys(options)
                .forEach(function (key) {
                var tkey = (key);
                if (options[tkey] === undefined) {
                    delete options[tkey];
                }
            });
            _this.ControlComponent.control = new GeolocateControl(options);
            _this.MapService.addControl(_this.ControlComponent.control, _this.ControlComponent.position);
        });
    };
    return GeolocateControlDirective;
}());
GeolocateControlDirective.decorators = [
    { type: Directive, args: [{
                selector: '[mglGeolocate]'
            },] },
];
GeolocateControlDirective.ctorParameters = function () { return [
    { type: MapService, },
    { type: ControlComponent, decorators: [{ type: Host },] },
]; };
GeolocateControlDirective.propDecorators = {
    "positionOptions": [{ type: Input },],
    "fitBoundsOptions": [{ type: Input },],
    "trackUserLocation": [{ type: Input },],
    "showUserLocation": [{ type: Input },],
};
var NavigationControlDirective = /** @class */ (function () {
    function NavigationControlDirective(MapService$$1, ControlComponent$$1) {
        this.MapService = MapService$$1;
        this.ControlComponent = ControlComponent$$1;
    }
    NavigationControlDirective.prototype.ngOnInit = function () {
        var _this = this;
        this.MapService.mapCreated$.subscribe(function () {
            if (_this.ControlComponent.control) {
                throw new Error('Another control is already set for this control');
            }
            _this.ControlComponent.control = new NavigationControl();
            _this.MapService.addControl(_this.ControlComponent.control, _this.ControlComponent.position);
        });
    };
    return NavigationControlDirective;
}());
NavigationControlDirective.decorators = [
    { type: Directive, args: [{
                selector: '[mglNavigation]'
            },] },
];
NavigationControlDirective.ctorParameters = function () { return [
    { type: MapService, },
    { type: ControlComponent, decorators: [{ type: Host },] },
]; };
var ScaleControlDirective = /** @class */ (function () {
    function ScaleControlDirective(MapService$$1, ControlComponent$$1) {
        this.MapService = MapService$$1;
        this.ControlComponent = ControlComponent$$1;
    }
    ScaleControlDirective.prototype.ngOnChanges = function (changes) {
        if (changes["unit"] && !changes["unit"].isFirstChange()) {
            ((this.ControlComponent.control)).setUnit(changes["unit"].currentValue);
        }
    };
    ScaleControlDirective.prototype.ngOnInit = function () {
        var _this = this;
        this.MapService.mapCreated$.subscribe(function () {
            if (_this.ControlComponent.control) {
                throw new Error('Another control is already set for this control');
            }
            var options = {};
            if (_this.maxWidth !== undefined) {
                options.maxWidth = _this.maxWidth;
            }
            if (_this.unit !== undefined) {
                options.unit = _this.unit;
            }
            _this.ControlComponent.control = new ScaleControl(options);
            _this.MapService.addControl(_this.ControlComponent.control, _this.ControlComponent.position);
        });
    };
    return ScaleControlDirective;
}());
ScaleControlDirective.decorators = [
    { type: Directive, args: [{
                selector: '[mglScale]'
            },] },
];
ScaleControlDirective.ctorParameters = function () { return [
    { type: MapService, },
    { type: ControlComponent, decorators: [{ type: Host },] },
]; };
ScaleControlDirective.propDecorators = {
    "maxWidth": [{ type: Input },],
    "unit": [{ type: Input },],
};
var LayerComponent = /** @class */ (function () {
    function LayerComponent(MapService$$1) {
        this.MapService = MapService$$1;
        this.click = new EventEmitter();
        this.mouseEnter = new EventEmitter();
        this.mouseLeave = new EventEmitter();
        this.mouseMove = new EventEmitter();
        this.layerAdded = false;
    }
    LayerComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.MapService.mapLoaded$.subscribe(function () {
            _this.MapService.addLayer({
                layerOptions: {
                    id: _this.id,
                    type: _this.type,
                    source: _this.source,
                    metadata: _this.metadata,
                    'source-layer': _this.sourceLayer,
                    minzoom: _this.minzoom,
                    maxzoom: _this.maxzoom,
                    filter: _this.filter,
                    layout: _this.layout,
                    paint: _this.paint
                },
                layerEvents: {
                    click: _this.click,
                    mouseEnter: _this.mouseEnter,
                    mouseLeave: _this.mouseLeave,
                    mouseMove: _this.mouseMove
                }
            }, _this.before);
            _this.layerAdded = true;
        });
    };
    LayerComponent.prototype.ngOnChanges = function (changes) {
        if (!this.layerAdded) {
            return;
        }
        if (changes["paint"] && !changes["paint"].isFirstChange()) {
            this.MapService.setAllLayerPaintProperty(this.id, ((changes["paint"].currentValue)));
        }
        if (changes["layout"] && !changes["layout"].isFirstChange()) {
            this.MapService.setAllLayerLayoutProperty(this.id, ((changes["layout"].currentValue)));
        }
        if (changes["filter"] && !changes["filter"].isFirstChange()) {
            this.MapService.setLayerFilter(this.id, ((changes["filter"].currentValue)));
        }
        if (changes["before"] && !changes["before"].isFirstChange()) {
            this.MapService.setLayerBefore(this.id, ((changes["before"].currentValue)));
        }
        if (changes["minzoom"] && !changes["minzoom"].isFirstChange() ||
            changes["maxzoom"] && !changes["maxzoom"].isFirstChange()) {
            this.MapService.setLayerZoomRange(this.id, this.minzoom, this.maxzoom);
        }
    };
    LayerComponent.prototype.ngOnDestroy = function () {
        if (this.layerAdded) {
            this.MapService.removeLayer(this.id);
        }
    };
    return LayerComponent;
}());
LayerComponent.decorators = [
    { type: Component, args: [{
                selector: 'mgl-layer',
                template: ''
            },] },
];
LayerComponent.ctorParameters = function () { return [
    { type: MapService, },
]; };
LayerComponent.propDecorators = {
    "id": [{ type: Input },],
    "source": [{ type: Input },],
    "type": [{ type: Input },],
    "metadata": [{ type: Input },],
    "sourceLayer": [{ type: Input },],
    "filter": [{ type: Input },],
    "layout": [{ type: Input },],
    "paint": [{ type: Input },],
    "before": [{ type: Input },],
    "minzoom": [{ type: Input },],
    "maxzoom": [{ type: Input },],
    "click": [{ type: Output },],
    "mouseEnter": [{ type: Output },],
    "mouseLeave": [{ type: Output },],
    "mouseMove": [{ type: Output },],
};
var MarkerComponent = /** @class */ (function () {
    function MarkerComponent(MapService$$1) {
        this.MapService = MapService$$1;
        this.className = '';
    }
    MarkerComponent.prototype.ngOnInit = function () {
        if (this.feature && this.lngLat) {
            throw new Error('feature and lngLat input are mutually exclusive');
        }
    };
    MarkerComponent.prototype.ngOnChanges = function (changes) {
        if (changes["lngLat"] && !changes["lngLat"].isFirstChange()) {
            ((this.markerInstance)).setLngLat(((this.lngLat)));
        }
        if (changes["feature"] && !changes["feature"].isFirstChange()) {
            ((this.markerInstance)).setLngLat(((((this.feature)).geometry)).coordinates);
        }
    };
    MarkerComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        var options = { offset: this.offset, anchor: this.anchor, element: undefined };
        if (this.content.nativeElement.childNodes.length > 0) {
            options.element = this.content.nativeElement;
        }
        this.markerInstance = new Marker(options);
        this.markerInstance.setLngLat(this.feature ? ((this.feature.geometry)).coordinates : ((this.lngLat)));
        this.MapService.mapCreated$.subscribe(function () {
            _this.MapService.addMarker(((_this.markerInstance)));
        });
    };
    MarkerComponent.prototype.ngOnDestroy = function () {
        this.MapService.removeMarker(((this.markerInstance)));
        this.markerInstance = undefined;
    };
    MarkerComponent.prototype.togglePopup = function () {
        ((this.markerInstance)).togglePopup();
    };
    MarkerComponent.prototype.updateCoordinates = function (coordinates) {
        ((this.markerInstance)).setLngLat(coordinates);
    };
    return MarkerComponent;
}());
MarkerComponent.decorators = [
    { type: Component, args: [{
                selector: 'mgl-marker',
                template: '<div [class]="className" #content><ng-content></ng-content></div>',
                styles: ["\n    .mapboxgl-marker {\n      line-height: 0;\n    }\n  "],
                encapsulation: ViewEncapsulation.None,
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
MarkerComponent.ctorParameters = function () { return [
    { type: MapService, },
]; };
MarkerComponent.propDecorators = {
    "offset": [{ type: Input },],
    "anchor": [{ type: Input },],
    "feature": [{ type: Input },],
    "lngLat": [{ type: Input },],
    "className": [{ type: Input },],
    "content": [{ type: ViewChild, args: ['content',] },],
};
var GeoJSONSourceComponent = /** @class */ (function () {
    function GeoJSONSourceComponent(MapService$$1) {
        this.MapService = MapService$$1;
        this.updateFeatureData = new Subject();
        this.sourceAdded = false;
        this.featureIdCounter = 0;
    }
    GeoJSONSourceComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (!this.data) {
            this.data = {
                type: 'FeatureCollection',
                features: []
            };
        }
        this.MapService.mapLoaded$.subscribe(function () {
            _this.MapService.addSource(_this.id, {
                type: 'geojson',
                data: _this.data,
                maxzoom: _this.maxzoom,
                minzoom: _this.minzoom,
                buffer: _this.buffer,
                tolerance: _this.tolerance,
                cluster: _this.cluster,
                clusterRadius: _this.clusterRadius,
                clusterMaxZoom: _this.clusterMaxZoom,
            });
            _this.sub = _this.updateFeatureData.pipe(debounceTime(0)).subscribe(function () {
                var source = _this.MapService.getSource(_this.id);
                source.setData(((_this.data)));
            });
            _this.sourceAdded = true;
        });
    };
    GeoJSONSourceComponent.prototype.ngOnChanges = function (changes) {
        if (!this.sourceAdded) {
            return;
        }
        if (changes["maxzoom"] && !changes["maxzoom"].isFirstChange() ||
            changes["minzoom"] && !changes["minzoom"].isFirstChange() ||
            changes["buffer"] && !changes["buffer"].isFirstChange() ||
            changes["tolerance"] && !changes["tolerance"].isFirstChange() ||
            changes["cluster"] && !changes["cluster"].isFirstChange() ||
            changes["clusterRadius"] && !changes["clusterRadius"].isFirstChange() ||
            changes["clusterMaxZoom"] && !changes["clusterMaxZoom"].isFirstChange()) {
            this.ngOnDestroy();
            this.ngOnInit();
        }
        if (changes["data"] && !changes["data"].isFirstChange()) {
            var source = this.MapService.getSource(this.id);
            source.setData(((this.data)));
        }
    };
    GeoJSONSourceComponent.prototype.ngOnDestroy = function () {
        if (this.sourceAdded) {
            this.sub.unsubscribe();
            this.MapService.removeSource(this.id);
        }
    };
    GeoJSONSourceComponent.prototype.addFeature = function (feature) {
        var collection = (this.data);
        collection.features.push(feature);
        this.updateFeatureData.next();
    };
    GeoJSONSourceComponent.prototype.removeFeature = function (feature) {
        var collection = (this.data);
        var index = collection.features.indexOf(feature);
        if (index > -1) {
            collection.features.splice(index, 1);
        }
        this.updateFeatureData.next();
    };
    GeoJSONSourceComponent.prototype.getNewFeatureId = function () {
        return ++this.featureIdCounter;
    };
    return GeoJSONSourceComponent;
}());
GeoJSONSourceComponent.decorators = [
    { type: Component, args: [{
                selector: 'mgl-geojson-source',
                template: '',
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
GeoJSONSourceComponent.ctorParameters = function () { return [
    { type: MapService, },
]; };
GeoJSONSourceComponent.propDecorators = {
    "id": [{ type: Input },],
    "data": [{ type: Input },],
    "minzoom": [{ type: Input },],
    "maxzoom": [{ type: Input },],
    "buffer": [{ type: Input },],
    "tolerance": [{ type: Input },],
    "cluster": [{ type: Input },],
    "clusterRadius": [{ type: Input },],
    "clusterMaxZoom": [{ type: Input },],
};
var FeatureComponent = /** @class */ (function () {
    function FeatureComponent(GeoJSONSourceComponent$$1) {
        this.GeoJSONSourceComponent = GeoJSONSourceComponent$$1;
        this.type = 'Feature';
    }
    FeatureComponent.prototype.ngOnInit = function () {
        if (!this.id) {
            this.id = this.GeoJSONSourceComponent.getNewFeatureId();
        }
        this.feature = {
            type: this.type,
            geometry: this.geometry,
            properties: this.properties ? this.properties : {}
        };
        this.feature.id = this.id;
        this.GeoJSONSourceComponent.addFeature(this.feature);
    };
    FeatureComponent.prototype.ngOnDestroy = function () {
        this.GeoJSONSourceComponent.removeFeature(this.feature);
    };
    FeatureComponent.prototype.updateCoordinates = function (coordinates) {
        ((this.feature.geometry)).coordinates = coordinates;
        this.GeoJSONSourceComponent.updateFeatureData.next();
    };
    return FeatureComponent;
}());
FeatureComponent.decorators = [
    { type: Component, args: [{
                selector: 'mgl-feature',
                template: '',
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
FeatureComponent.ctorParameters = function () { return [
    { type: GeoJSONSourceComponent, decorators: [{ type: Inject, args: [forwardRef(function () { return GeoJSONSourceComponent; }),] },] },
]; };
FeatureComponent.propDecorators = {
    "id": [{ type: Input },],
    "geometry": [{ type: Input },],
    "properties": [{ type: Input },],
};
var DraggableDirective = /** @class */ (function () {
    function DraggableDirective(MapService$$1, NgZone$$1, FeatureComponent$$1, MarkerComponent$$1) {
        this.MapService = MapService$$1;
        this.NgZone = NgZone$$1;
        this.FeatureComponent = FeatureComponent$$1;
        this.MarkerComponent = MarkerComponent$$1;
        this.dragStart = new EventEmitter();
        this.dragEnd = new EventEmitter();
        this.drag = new EventEmitter();
        this.destroyed$ = new ReplaySubject(1);
    }
    DraggableDirective.prototype.ngOnInit = function () {
        var enter$;
        var leave$;
        var updateCoords;
        if (this.MarkerComponent) {
            var markerElement = ((this.MarkerComponent.content.nativeElement));
            if (markerElement.children.length === 1) {
                markerElement = markerElement.children[0];
            }
            enter$ = fromEvent(markerElement, 'mouseenter');
            leave$ = fromEvent(markerElement, 'mouseleave');
            updateCoords = this.MarkerComponent.updateCoordinates.bind(this.MarkerComponent);
        }
        else if (this.FeatureComponent && this.layer) {
            enter$ = this.layer.mouseEnter;
            leave$ = this.layer.mouseLeave;
            updateCoords = this.FeatureComponent.updateCoordinates.bind(this.FeatureComponent);
            if (this.FeatureComponent.geometry.type !== 'Point') {
                throw new Error('mglDraggable only support point feature');
            }
        }
        else {
            throw new Error('mglDraggable can only be used on Feature (with a layer as input) or Marker');
        }
        this.handleDraggable(enter$, leave$, updateCoords);
    };
    DraggableDirective.prototype.ngOnDestroy = function () {
        this.destroyed$.next(undefined);
        this.destroyed$.complete();
    };
    DraggableDirective.prototype.handleDraggable = function (enter$, leave$, updateCoords) {
        var _this = this;
        var moving = false;
        var inside = false;
        this.MapService.mapCreated$.subscribe(function () {
            var mouseUp$ = fromEvent(_this.MapService.mapInstance, 'mouseup');
            var dragStart$ = enter$.pipe(takeUntil(_this.destroyed$), filter(function () { return !moving; }), filter(function (evt) { return _this.filterFeature(evt); }), tap(function () {
                inside = true;
                _this.MapService.changeCanvasCursor('move');
                _this.MapService.updateDragPan(false);
            }), switchMap(function () { return fromEvent(_this.MapService.mapInstance, 'mousedown')
                .pipe(takeUntil(leave$)); }));
            var dragging$ = dragStart$.pipe(switchMap(function () { return fromEvent(_this.MapService.mapInstance, 'mousemove')
                .pipe(takeUntil(mouseUp$)); }));
            var dragEnd$ = dragStart$.pipe(switchMap(function () { return mouseUp$.pipe(take(1)); }));
            dragStart$.subscribe(function (evt) {
                moving = true;
                if (_this.dragStart.observers.length) {
                    _this.NgZone.run(function () { return _this.dragStart.emit(evt); });
                }
            });
            dragging$.subscribe(function (evt) {
                updateCoords([evt.lngLat.lng, evt.lngLat.lat]);
                if (_this.drag.observers.length) {
                    _this.NgZone.run(function () { return _this.drag.emit(evt); });
                }
            });
            dragEnd$.subscribe(function (evt) {
                moving = false;
                if (_this.dragEnd.observers.length) {
                    _this.NgZone.run(function () { return _this.dragEnd.emit(evt); });
                }
                if (!inside) {
                    _this.MapService.changeCanvasCursor('');
                    _this.MapService.updateDragPan(true);
                }
            });
            leave$.pipe(takeUntil(_this.destroyed$), tap(function () { return inside = false; }), filter(function () { return !moving; })).subscribe(function () {
                _this.MapService.changeCanvasCursor('');
                _this.MapService.updateDragPan(true);
            });
        });
    };
    DraggableDirective.prototype.filterFeature = function (evt) {
        if (this.FeatureComponent && this.layer) {
            var feature = this.MapService.queryRenderedFeatures(evt.point, {
                layers: [this.layer.id],
                filter: [
                    'all',
                    ['==', '$type', 'Point'],
                    ['==', '$id', this.FeatureComponent.id]
                ]
            })[0];
            if (!feature) {
                return false;
            }
        }
        return true;
    };
    return DraggableDirective;
}());
DraggableDirective.decorators = [
    { type: Directive, args: [{
                selector: '[mglDraggable]'
            },] },
];
DraggableDirective.ctorParameters = function () { return [
    { type: MapService, },
    { type: NgZone, },
    { type: FeatureComponent, decorators: [{ type: Optional }, { type: Host },] },
    { type: MarkerComponent, decorators: [{ type: Optional }, { type: Host },] },
]; };
DraggableDirective.propDecorators = {
    "layer": [{ type: Input, args: ['mglDraggable',] },],
    "dragStart": [{ type: Output },],
    "dragEnd": [{ type: Output },],
    "drag": [{ type: Output },],
};
var ImageComponent = /** @class */ (function () {
    function ImageComponent(MapService$$1, zone) {
        this.MapService = MapService$$1;
        this.zone = zone;
        this.error = new EventEmitter();
        this.loaded = new EventEmitter();
        this.imageAdded = false;
    }
    ImageComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.MapService.mapLoaded$.subscribe(function () { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.data) return [3 /*break*/, 1];
                        this.MapService.addImage(this.id, this.data, this.options);
                        this.imageAdded = true;
                        return [3 /*break*/, 5];
                    case 1:
                        if (!this.url) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.MapService.loadAndAddImage(this.id, this.url, this.options)];
                    case 3:
                        _a.sent();
                        this.imageAdded = true;
                        this.zone.run(function () {
                            _this.loaded.emit();
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        this.zone.run(function () {
                            _this.error.emit(error_1);
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
    };
    ImageComponent.prototype.ngOnChanges = function (changes) {
        if (changes["data"] && !changes["data"].isFirstChange() ||
            changes["options"] && !changes["options"].isFirstChange() ||
            changes["url"] && !changes["url"].isFirstChange()) {
            this.ngOnDestroy();
            this.ngOnInit();
        }
    };
    ImageComponent.prototype.ngOnDestroy = function () {
        if (this.imageAdded) {
            this.MapService.removeImage(this.id);
        }
    };
    return ImageComponent;
}());
ImageComponent.decorators = [
    { type: Component, args: [{
                selector: 'mgl-image',
                template: ''
            },] },
];
ImageComponent.ctorParameters = function () { return [
    { type: MapService, },
    { type: NgZone, },
]; };
ImageComponent.propDecorators = {
    "id": [{ type: Input },],
    "data": [{ type: Input },],
    "options": [{ type: Input },],
    "url": [{ type: Input },],
    "error": [{ type: Output },],
    "loaded": [{ type: Output },],
};
var MapComponent = /** @class */ (function () {
    function MapComponent(MapService$$1) {
        this.MapService = MapService$$1;
        this.movingMethod = 'flyTo';
        this.resize = new EventEmitter();
        this.remove = new EventEmitter();
        this.mouseDown = new EventEmitter();
        this.mouseUp = new EventEmitter();
        this.mouseMove = new EventEmitter();
        this.click = new EventEmitter();
        this.dblClick = new EventEmitter();
        this.mouseEnter = new EventEmitter();
        this.mouseLeave = new EventEmitter();
        this.mouseOver = new EventEmitter();
        this.mouseOut = new EventEmitter();
        this.contextMenu = new EventEmitter();
        this.touchStart = new EventEmitter();
        this.touchEnd = new EventEmitter();
        this.touchMove = new EventEmitter();
        this.touchCancel = new EventEmitter();
        this.wheel = new EventEmitter();
        this.moveStart = new EventEmitter();
        this.move = new EventEmitter();
        this.moveEnd = new EventEmitter();
        this.dragStart = new EventEmitter();
        this.drag = new EventEmitter();
        this.dragEnd = new EventEmitter();
        this.zoomStart = new EventEmitter();
        this.zoomEvt = new EventEmitter();
        this.zoomEnd = new EventEmitter();
        this.rotateStart = new EventEmitter();
        this.rotate = new EventEmitter();
        this.rotateEnd = new EventEmitter();
        this.pitchStart = new EventEmitter();
        this.pitchEvt = new EventEmitter();
        this.pitchEnd = new EventEmitter();
        this.boxZoomStart = new EventEmitter();
        this.boxZoomEnd = new EventEmitter();
        this.boxZoomCancel = new EventEmitter();
        this.webGlContextLost = new EventEmitter();
        this.webGlContextRestored = new EventEmitter();
        this.load = new EventEmitter();
        this.render = new EventEmitter();
        this.error = new EventEmitter();
        this.data = new EventEmitter();
        this.styleData = new EventEmitter();
        this.sourceData = new EventEmitter();
        this.dataLoading = new EventEmitter();
        this.styleDataLoading = new EventEmitter();
        this.sourceDataLoading = new EventEmitter();
    }
    Object.defineProperty(MapComponent.prototype, "mapInstance", {
        get: function () {
            return this.MapService.mapInstance;
        },
        enumerable: true,
        configurable: true
    });
    MapComponent.prototype.ngAfterViewInit = function () {
        this.MapService.setup({
            accessToken: this.accessToken,
            customMapboxApiUrl: this.customMapboxApiUrl,
            mapOptions: {
                container: this.mapContainer.nativeElement,
                minZoom: this.minZoom,
                maxZoom: this.maxZoom,
                style: this.style,
                hash: this.hash,
                interactive: this.interactive,
                bearingSnap: this.bearingSnap,
                pitchWithRotate: this.pitchWithRotate,
                classes: this.classes,
                attributionControl: this.attributionControl,
                logoPosition: this.logoPosition,
                failIfMajorPerformanceCaveat: this.failIfMajorPerformanceCaveat,
                preserveDrawingBuffer: this.preserveDrawingBuffer,
                refreshExpiredTiles: this.refreshExpiredTiles,
                maxBounds: this.maxBounds,
                scrollZoom: this.scrollZoom,
                boxZoom: this.boxZoom,
                dragRotate: this.dragRotate,
                dragPan: this.dragPan,
                keyboard: this.keyboard,
                doubleClickZoom: this.doubleClickZoom,
                touchZoomRotate: this.touchZoomRotate,
                trackResize: this.trackResize,
                center: this.center,
                zoom: this.zoom,
                bearing: this.bearing,
                pitch: this.pitch,
                renderWorldCopies: this.renderWorldCopies,
                maxTileCacheSize: this.maxTileCacheSize,
                localIdeographFontFamily: this.localIdeographFontFamily,
                transformRequest: this.transformRequest
            },
            mapEvents: this
        });
        if (this.cursorStyle) {
            this.MapService.changeCanvasCursor(this.cursorStyle);
        }
    };
    MapComponent.prototype.ngOnDestroy = function () {
        this.MapService.destroyMap();
    };
    MapComponent.prototype.ngOnChanges = function (changes) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.MapService.mapCreated$.toPromise()];
                    case 1:
                        _a.sent();
                        if (changes["cursorStyle"] && !changes["cursorStyle"].isFirstChange()) {
                            this.MapService.changeCanvasCursor(changes["cursorStyle"].currentValue);
                        }
                        if (changes["minZoom"] && !changes["minZoom"].isFirstChange()) {
                            this.MapService.updateMinZoom(changes["minZoom"].currentValue);
                        }
                        if (changes["maxZoom"] && !changes["maxZoom"].isFirstChange()) {
                            this.MapService.updateMaxZoom(changes["maxZoom"].currentValue);
                        }
                        if (changes["scrollZoom"] && !changes["scrollZoom"].isFirstChange()) {
                            this.MapService.updateScrollZoom(changes["scrollZoom"].currentValue);
                        }
                        if (changes["dragRotate"] && !changes["dragRotate"].isFirstChange()) {
                            this.MapService.updateDragRotate(changes["dragRotate"].currentValue);
                        }
                        if (changes["touchZoomRotate"] && !changes["touchZoomRotate"].isFirstChange()) {
                            this.MapService.updateTouchZoomRotate(changes["touchZoomRotate"].currentValue);
                        }
                        if (changes["doubleClickZoom"] && !changes["doubleClickZoom"].isFirstChange()) {
                            this.MapService.updateDoubleClickZoom(changes["doubleClickZoom"].currentValue);
                        }
                        if (changes["keyboard"] && !changes["keyboard"].isFirstChange()) {
                            this.MapService.updateKeyboard(changes["keyboard"].currentValue);
                        }
                        if (changes["dragPan"] && !changes["dragPan"].isFirstChange()) {
                            this.MapService.updateDragPan(changes["dragPan"].currentValue);
                        }
                        if (changes["boxZoom"] && !changes["boxZoom"].isFirstChange()) {
                            this.MapService.updateBoxZoom(changes["boxZoom"].currentValue);
                        }
                        if (changes["style"] && !changes["style"].isFirstChange()) {
                            this.MapService.updateStyle(changes["style"].currentValue);
                        }
                        if (changes["maxBounds"] && !changes["maxBounds"].isFirstChange()) {
                            this.MapService.updateMaxBounds(changes["maxBounds"].currentValue);
                        }
                        if (changes["fitBounds"] && !changes["fitBounds"].isFirstChange()) {
                            this.MapService.fitBounds(changes["fitBounds"].currentValue, this.fitBoundsOptions);
                        }
                        if (this.centerWithPanTo && changes["center"] && !changes["center"].isFirstChange() &&
                            !changes["zoom"] && !changes["bearing"] && !changes["pitch"]) {
                            this.MapService.panTo(((this.center)), this.panToOptions);
                        }
                        else if (changes["center"] && !changes["center"].isFirstChange() ||
                            changes["zoom"] && !changes["zoom"].isFirstChange() ||
                            changes["bearing"] && !changes["bearing"].isFirstChange() ||
                            changes["pitch"] && !changes["pitch"].isFirstChange()) {
                            this.MapService.move(this.movingMethod, this.movingOptions, changes["zoom"] && this.zoom ? this.zoom[0] : undefined, changes["center"] ? this.center : undefined, changes["bearing"] && this.bearing ? this.bearing[0] : undefined, changes["pitch"] && this.pitch ? this.pitch[0] : undefined);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return MapComponent;
}());
MapComponent.decorators = [
    { type: Component, args: [{
                selector: 'mgl-map',
                template: '<div #container></div>',
                styles: ["\n  :host {\n    display: block;\n  }\n  div {\n    height: 100%;\n    width: 100%;\n  }\n  "],
                providers: [
                    MapService
                ],
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
MapComponent.ctorParameters = function () { return [
    { type: MapService, },
]; };
MapComponent.propDecorators = {
    "accessToken": [{ type: Input },],
    "customMapboxApiUrl": [{ type: Input },],
    "hash": [{ type: Input },],
    "refreshExpiredTiles": [{ type: Input },],
    "failIfMajorPerformanceCaveat": [{ type: Input },],
    "classes": [{ type: Input },],
    "bearingSnap": [{ type: Input },],
    "interactive": [{ type: Input },],
    "pitchWithRotate": [{ type: Input },],
    "attributionControl": [{ type: Input },],
    "logoPosition": [{ type: Input },],
    "maxTileCacheSize": [{ type: Input },],
    "localIdeographFontFamily": [{ type: Input },],
    "preserveDrawingBuffer": [{ type: Input },],
    "renderWorldCopies": [{ type: Input },],
    "trackResize": [{ type: Input },],
    "transformRequest": [{ type: Input },],
    "minZoom": [{ type: Input },],
    "maxZoom": [{ type: Input },],
    "scrollZoom": [{ type: Input },],
    "dragRotate": [{ type: Input },],
    "touchZoomRotate": [{ type: Input },],
    "doubleClickZoom": [{ type: Input },],
    "keyboard": [{ type: Input },],
    "dragPan": [{ type: Input },],
    "boxZoom": [{ type: Input },],
    "style": [{ type: Input },],
    "center": [{ type: Input },],
    "maxBounds": [{ type: Input },],
    "zoom": [{ type: Input },],
    "bearing": [{ type: Input },],
    "pitch": [{ type: Input },],
    "movingMethod": [{ type: Input },],
    "movingOptions": [{ type: Input },],
    "fitBounds": [{ type: Input },],
    "fitBoundsOptions": [{ type: Input },],
    "centerWithPanTo": [{ type: Input },],
    "panToOptions": [{ type: Input },],
    "cursorStyle": [{ type: Input },],
    "resize": [{ type: Output },],
    "remove": [{ type: Output },],
    "mouseDown": [{ type: Output },],
    "mouseUp": [{ type: Output },],
    "mouseMove": [{ type: Output },],
    "click": [{ type: Output },],
    "dblClick": [{ type: Output },],
    "mouseEnter": [{ type: Output },],
    "mouseLeave": [{ type: Output },],
    "mouseOver": [{ type: Output },],
    "mouseOut": [{ type: Output },],
    "contextMenu": [{ type: Output },],
    "touchStart": [{ type: Output },],
    "touchEnd": [{ type: Output },],
    "touchMove": [{ type: Output },],
    "touchCancel": [{ type: Output },],
    "wheel": [{ type: Output },],
    "moveStart": [{ type: Output },],
    "move": [{ type: Output },],
    "moveEnd": [{ type: Output },],
    "dragStart": [{ type: Output },],
    "drag": [{ type: Output },],
    "dragEnd": [{ type: Output },],
    "zoomStart": [{ type: Output },],
    "zoomEvt": [{ type: Output },],
    "zoomEnd": [{ type: Output },],
    "rotateStart": [{ type: Output },],
    "rotate": [{ type: Output },],
    "rotateEnd": [{ type: Output },],
    "pitchStart": [{ type: Output },],
    "pitchEvt": [{ type: Output },],
    "pitchEnd": [{ type: Output },],
    "boxZoomStart": [{ type: Output },],
    "boxZoomEnd": [{ type: Output },],
    "boxZoomCancel": [{ type: Output },],
    "webGlContextLost": [{ type: Output },],
    "webGlContextRestored": [{ type: Output },],
    "load": [{ type: Output },],
    "render": [{ type: Output },],
    "error": [{ type: Output },],
    "data": [{ type: Output },],
    "styleData": [{ type: Output },],
    "sourceData": [{ type: Output },],
    "dataLoading": [{ type: Output },],
    "styleDataLoading": [{ type: Output },],
    "sourceDataLoading": [{ type: Output },],
    "mapContainer": [{ type: ViewChild, args: ['container',] },],
};
var PointDirective = /** @class */ (function () {
    function PointDirective() {
    }
    return PointDirective;
}());
PointDirective.decorators = [
    { type: Directive, args: [{ selector: 'ng-template[mglPoint]' },] },
];
var ClusterPointDirective = /** @class */ (function () {
    function ClusterPointDirective() {
    }
    return ClusterPointDirective;
}());
ClusterPointDirective.decorators = [
    { type: Directive, args: [{ selector: 'ng-template[mglClusterPoint]' },] },
];
var MarkerClusterComponent = /** @class */ (function () {
    function MarkerClusterComponent(MapService$$1, ChangeDetectorRef$$1, zone) {
        var _this = this;
        this.MapService = MapService$$1;
        this.ChangeDetectorRef = ChangeDetectorRef$$1;
        this.zone = zone;
        this.load = new EventEmitter();
        this.sub = new Subscription();
        this.getLeavesFn = function (feature) {
            return function (limit, offset) { return ((_this.supercluster.getLeaves))(((feature.properties.cluster_id)), limit, offset); };
        };
        this.getChildrenFn = function (feature) {
            return function () { return ((_this.supercluster.getChildren))(((feature.properties.cluster_id))); };
        };
        this.getClusterExpansionZoomFn = function (feature) {
            return function () { return ((_this.supercluster.getClusterExpansionZoom))(((feature.properties.cluster_id))); };
        };
    }
    MarkerClusterComponent.prototype.ngOnInit = function () {
        var options = {
            radius: this.radius,
            maxZoom: this.maxZoom,
            minZoom: this.minZoom,
            extent: this.extent,
            nodeSize: this.nodeSize,
            log: this.log,
            reduce: this.reduce,
            initial: this.initial,
            map: this.map
        };
        Object.keys(options)
            .forEach(function (key) {
            var tkey = (key);
            if (options[tkey] === undefined) {
                delete options[tkey];
            }
        });
        this.supercluster = supercluster(options);
        this.supercluster.load(this.data.features);
        this.load.emit(this.supercluster);
    };
    MarkerClusterComponent.prototype.ngOnChanges = function (changes) {
        if (changes["data"] && !changes["data"].isFirstChange()) {
            this.supercluster.load(this.data.features);
        }
    };
    MarkerClusterComponent.prototype.ngAfterContentInit = function () {
        var _this = this;
        this.MapService.mapCreated$.subscribe(function () {
            var mapMove$ = merge(fromEvent(_this.MapService.mapInstance, 'zoomChange'), fromEvent(_this.MapService.mapInstance, 'move'));
            var sub = mapMove$.pipe(startWith(undefined)).subscribe(function () {
                _this.zone.run(function () {
                    _this.updateCluster();
                });
            });
            _this.sub.add(sub);
        });
    };
    MarkerClusterComponent.prototype.ngOnDestroy = function () {
        this.sub.unsubscribe();
    };
    MarkerClusterComponent.prototype.updateCluster = function () {
        var bbox$$1 = this.MapService.getCurrentViewportBbox();
        var currentZoom = Math.round(this.MapService.mapInstance.getZoom());
        this.clusterPoints = this.supercluster.getClusters(bbox$$1, currentZoom);
        this.ChangeDetectorRef.markForCheck();
    };
    return MarkerClusterComponent;
}());
MarkerClusterComponent.decorators = [
    { type: Component, args: [{
                selector: 'mgl-marker-cluster',
                template: "\n    <ng-container *ngFor=\"let feature of clusterPoints\">\n      <ng-container *ngIf=\"feature.properties.cluster; else point\">\n        <mgl-marker\n          [feature]=\"feature\"\n        >\n          <ng-container *ngTemplateOutlet=\"clusterPointTpl; context: {\n            $implicit: feature,\n            getLeavesFn: getLeavesFn(feature),\n            getChildrenFn: getChildrenFn(feature),\n            getClusterExpansionZoomFn: getClusterExpansionZoomFn(feature)\n          }\"></ng-container>\n        </mgl-marker>\n      </ng-container>\n      <ng-template #point>\n        <mgl-marker\n          [feature]=\"feature\"\n        >\n          <ng-container *ngTemplateOutlet=\"pointTpl; context: { $implicit: feature }\"></ng-container>\n        </mgl-marker>\n      </ng-template>\n    </ng-container>\n  ",
                changeDetection: ChangeDetectionStrategy.OnPush,
                preserveWhitespaces: false
            },] },
];
MarkerClusterComponent.ctorParameters = function () { return [
    { type: MapService, },
    { type: ChangeDetectorRef, },
    { type: NgZone, },
]; };
MarkerClusterComponent.propDecorators = {
    "radius": [{ type: Input },],
    "maxZoom": [{ type: Input },],
    "minZoom": [{ type: Input },],
    "extent": [{ type: Input },],
    "nodeSize": [{ type: Input },],
    "log": [{ type: Input },],
    "reduce": [{ type: Input },],
    "initial": [{ type: Input },],
    "map": [{ type: Input },],
    "data": [{ type: Input },],
    "load": [{ type: Output },],
    "pointTpl": [{ type: ContentChild, args: [PointDirective, { read: TemplateRef },] },],
    "clusterPointTpl": [{ type: ContentChild, args: [ClusterPointDirective, { read: TemplateRef },] },],
};
var PopupComponent = /** @class */ (function () {
    function PopupComponent(MapService$$1) {
        this.MapService = MapService$$1;
        this.close = new EventEmitter();
        this.open = new EventEmitter();
    }
    PopupComponent.prototype.ngOnInit = function () {
        if (this.lngLat && this.marker) {
            throw new Error('marker and lngLat input are mutually exclusive');
        }
    };
    PopupComponent.prototype.ngOnChanges = function (changes) {
        if (changes["lngLat"] && !changes["lngLat"].isFirstChange()) {
            this.MapService.removePopupFromMap(((this.popupInstance)));
            var popupInstanceTmp = this.createPopup();
            this.MapService.addPopupToMap(popupInstanceTmp, changes["lngLat"].currentValue);
            this.popupInstance = popupInstanceTmp;
        }
        if (changes["marker"] && !changes["marker"].isFirstChange()) {
            var previousMarker = changes["marker"].previousValue;
            if (previousMarker.markerInstance) {
                this.MapService.removePopupFromMarker(previousMarker.markerInstance);
            }
            if (this.marker && this.marker.markerInstance && this.popupInstance) {
                this.MapService.addPopupToMarker(this.marker.markerInstance, this.popupInstance);
            }
        }
    };
    PopupComponent.prototype.ngAfterViewInit = function () {
        this.popupInstance = this.createPopup();
        this.addPopup(this.popupInstance);
    };
    PopupComponent.prototype.ngOnDestroy = function () {
        if (this.popupInstance) {
            if (this.lngLat) {
                this.MapService.removePopupFromMap(this.popupInstance);
            }
            else if (this.marker && this.marker.markerInstance) {
                this.MapService.removePopupFromMarker(this.marker.markerInstance);
            }
        }
        this.popupInstance = undefined;
    };
    PopupComponent.prototype.createPopup = function () {
        return this.MapService.createPopup({
            popupOptions: {
                closeButton: this.closeButton,
                closeOnClick: this.closeOnClick,
                anchor: this.anchor,
                offset: this.offset
            },
            popupEvents: {
                open: this.open,
                close: this.close
            }
        }, this.content.nativeElement);
    };
    PopupComponent.prototype.addPopup = function (popup) {
        var _this = this;
        this.MapService.mapCreated$.subscribe(function () {
            if (_this.lngLat) {
                _this.MapService.addPopupToMap(popup, _this.lngLat);
            }
            else if (_this.marker && _this.marker.markerInstance) {
                _this.MapService.addPopupToMarker(_this.marker.markerInstance, popup);
            }
            else {
                throw new Error('mgl-popup need either lngLat or marker to be set');
            }
        });
    };
    return PopupComponent;
}());
PopupComponent.decorators = [
    { type: Component, args: [{
                selector: 'mgl-popup',
                template: '<div #content><ng-content></ng-content></div>',
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
PopupComponent.ctorParameters = function () { return [
    { type: MapService, },
]; };
PopupComponent.propDecorators = {
    "closeButton": [{ type: Input },],
    "closeOnClick": [{ type: Input },],
    "anchor": [{ type: Input },],
    "offset": [{ type: Input },],
    "lngLat": [{ type: Input },],
    "marker": [{ type: Input },],
    "close": [{ type: Output },],
    "open": [{ type: Output },],
    "content": [{ type: ViewChild, args: ['content',] },],
};
var CanvasSourceComponent = /** @class */ (function () {
    function CanvasSourceComponent(MapService$$1) {
        this.MapService = MapService$$1;
        this.sourceAdded = false;
    }
    CanvasSourceComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.MapService.mapLoaded$.subscribe(function () {
            var source = {
                type: 'canvas',
                coordinates: _this.coordinates,
                canvas: _this.canvas,
                animate: _this.animate,
            };
            _this.MapService.addSource(_this.id, source);
            _this.sourceAdded = true;
        });
    };
    CanvasSourceComponent.prototype.ngOnChanges = function (changes) {
        if (!this.sourceAdded) {
            return;
        }
        if (changes["coordinates"] && !changes["coordinates"].isFirstChange() ||
            changes["canvas"] && !changes["canvas"].isFirstChange() ||
            changes["animate"] && !changes["animate"].isFirstChange()) {
            this.ngOnDestroy();
            this.ngOnInit();
        }
    };
    CanvasSourceComponent.prototype.ngOnDestroy = function () {
        if (this.sourceAdded) {
            this.MapService.removeSource(this.id);
        }
    };
    return CanvasSourceComponent;
}());
CanvasSourceComponent.decorators = [
    { type: Component, args: [{
                selector: 'mgl-canvas-source',
                template: '',
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
CanvasSourceComponent.ctorParameters = function () { return [
    { type: MapService, },
]; };
CanvasSourceComponent.propDecorators = {
    "id": [{ type: Input },],
    "coordinates": [{ type: Input },],
    "canvas": [{ type: Input },],
    "animate": [{ type: Input },],
};
var ImageSourceComponent = /** @class */ (function () {
    function ImageSourceComponent(MapService$$1) {
        this.MapService = MapService$$1;
        this.sourceAdded = false;
    }
    ImageSourceComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.MapService.mapLoaded$.subscribe(function () {
            _this.MapService.addSource(_this.id, {
                type: 'image',
                url: _this.url,
                coordinates: _this.coordinates
            });
            _this.sourceAdded = true;
        });
    };
    ImageSourceComponent.prototype.ngOnChanges = function (changes) {
        if (!this.sourceAdded) {
            return;
        }
        if (changes["url"] && !changes["url"].isFirstChange() ||
            changes["coordinates"] && !changes["coordinates"].isFirstChange()) {
            this.ngOnDestroy();
            this.ngOnInit();
        }
    };
    ImageSourceComponent.prototype.ngOnDestroy = function () {
        if (this.sourceAdded) {
            this.MapService.removeSource(this.id);
        }
    };
    return ImageSourceComponent;
}());
ImageSourceComponent.decorators = [
    { type: Component, args: [{
                selector: 'mgl-image-source',
                template: '',
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
ImageSourceComponent.ctorParameters = function () { return [
    { type: MapService, },
]; };
ImageSourceComponent.propDecorators = {
    "id": [{ type: Input },],
    "url": [{ type: Input },],
    "coordinates": [{ type: Input },],
};
var RasterSourceComponent = /** @class */ (function () {
    function RasterSourceComponent(MapService$$1) {
        this.MapService = MapService$$1;
        this.type = 'raster';
        this.sourceAdded = false;
    }
    RasterSourceComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.MapService.mapLoaded$.subscribe(function () {
            var source = {
                type: _this.type,
                url: _this.url,
                tiles: _this.tiles,
                bounds: _this.bounds,
                minzoom: _this.minzoom,
                maxzoom: _this.maxzoom,
                tileSize: _this.tileSize
            };
            _this.MapService.addSource(_this.id, source);
            _this.sourceAdded = true;
        });
    };
    RasterSourceComponent.prototype.ngOnChanges = function (changes) {
        if (!this.sourceAdded) {
            return;
        }
        if (changes["url"] && !changes["url"].isFirstChange() ||
            changes["tiles"] && !changes["tiles"].isFirstChange() ||
            changes["bounds"] && !changes["bounds"].isFirstChange() ||
            changes["minzoom"] && !changes["minzoom"].isFirstChange() ||
            changes["maxzoom"] && !changes["maxzoom"].isFirstChange() ||
            changes["tileSize"] && !changes["tileSize"].isFirstChange()) {
            this.ngOnDestroy();
            this.ngOnInit();
        }
    };
    RasterSourceComponent.prototype.ngOnDestroy = function () {
        if (this.sourceAdded) {
            this.MapService.removeSource(this.id);
        }
    };
    return RasterSourceComponent;
}());
RasterSourceComponent.decorators = [
    { type: Component, args: [{
                selector: 'mgl-raster-source',
                template: '',
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
RasterSourceComponent.ctorParameters = function () { return [
    { type: MapService, },
]; };
RasterSourceComponent.propDecorators = {
    "id": [{ type: Input },],
    "url": [{ type: Input },],
    "tiles": [{ type: Input },],
    "bounds": [{ type: Input },],
    "minzoom": [{ type: Input },],
    "maxzoom": [{ type: Input },],
    "tileSize": [{ type: Input },],
};
var VectorSourceComponent = /** @class */ (function () {
    function VectorSourceComponent(MapService$$1) {
        this.MapService = MapService$$1;
        this.type = 'vector';
        this.sourceAdded = false;
    }
    VectorSourceComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.MapService.mapLoaded$.subscribe(function () {
            _this.MapService.addSource(_this.id, {
                type: _this.type,
                url: _this.url,
                tiles: _this.tiles,
                minzoom: _this.minzoom,
                maxzoom: _this.maxzoom,
            });
            _this.sourceAdded = true;
        });
    };
    VectorSourceComponent.prototype.ngOnChanges = function (changes) {
        if (!this.sourceAdded) {
            return;
        }
        if (changes["url"] && !changes["url"].isFirstChange() ||
            changes["tiles"] && !changes["tiles"].isFirstChange() ||
            changes["minzoom"] && !changes["minzoom"].isFirstChange() ||
            changes["maxzoom"] && !changes["maxzoom"].isFirstChange()) {
            this.ngOnDestroy();
            this.ngOnInit();
        }
    };
    VectorSourceComponent.prototype.ngOnDestroy = function () {
        if (this.sourceAdded) {
            this.MapService.removeSource(this.id);
        }
    };
    return VectorSourceComponent;
}());
VectorSourceComponent.decorators = [
    { type: Component, args: [{
                selector: 'mgl-vector-source',
                template: '',
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
VectorSourceComponent.ctorParameters = function () { return [
    { type: MapService, },
]; };
VectorSourceComponent.propDecorators = {
    "id": [{ type: Input },],
    "url": [{ type: Input },],
    "tiles": [{ type: Input },],
    "minzoom": [{ type: Input },],
    "maxzoom": [{ type: Input },],
};
var VideoSourceComponent = /** @class */ (function () {
    function VideoSourceComponent(MapService$$1) {
        this.MapService = MapService$$1;
        this.sourceAdded = false;
    }
    VideoSourceComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.MapService.mapLoaded$.subscribe(function () {
            _this.MapService.addSource(_this.id, {
                type: 'video',
                urls: _this.urls,
                coordinates: _this.coordinates
            });
            _this.sourceAdded = true;
        });
    };
    VideoSourceComponent.prototype.ngOnChanges = function (changes) {
        if (!this.sourceAdded) {
            return;
        }
        if (changes["urls"] && !changes["urls"].isFirstChange() ||
            changes["coordinates"] && !changes["coordinates"].isFirstChange()) {
            this.ngOnDestroy();
            this.ngOnInit();
        }
    };
    VideoSourceComponent.prototype.ngOnDestroy = function () {
        if (this.sourceAdded) {
            this.MapService.removeSource(this.id);
        }
    };
    return VideoSourceComponent;
}());
VideoSourceComponent.decorators = [
    { type: Component, args: [{
                selector: 'mgl-video-source',
                template: '',
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
VideoSourceComponent.ctorParameters = function () { return [
    { type: MapService, },
]; };
VideoSourceComponent.propDecorators = {
    "id": [{ type: Input },],
    "urls": [{ type: Input },],
    "coordinates": [{ type: Input },],
};
var NgxMapboxGLModule = /** @class */ (function () {
    function NgxMapboxGLModule() {
    }
    NgxMapboxGLModule.forRoot = function (config) {
        return {
            ngModule: NgxMapboxGLModule,
            providers: [
                {
                    provide: MAPBOX_API_KEY,
                    useValue: config.accessToken
                },
                {
                    provide: MAPBOX_GEOCODER_API_KEY,
                    useValue: config.geocoderAccessToken || config.accessToken
                }
            ],
        };
    };
    return NgxMapboxGLModule;
}());
NgxMapboxGLModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule
                ],
                declarations: [
                    MapComponent,
                    LayerComponent,
                    DraggableDirective,
                    ImageComponent,
                    VectorSourceComponent,
                    GeoJSONSourceComponent,
                    RasterSourceComponent,
                    ImageSourceComponent,
                    VideoSourceComponent,
                    CanvasSourceComponent,
                    FeatureComponent,
                    MarkerComponent,
                    PopupComponent,
                    ControlComponent,
                    FullscreenControlDirective,
                    NavigationControlDirective,
                    GeocoderControlDirective,
                    GeolocateControlDirective,
                    AttributionControlDirective,
                    ScaleControlDirective,
                    PointDirective,
                    ClusterPointDirective,
                    MarkerClusterComponent
                ],
                exports: [
                    MapComponent,
                    LayerComponent,
                    DraggableDirective,
                    ImageComponent,
                    VectorSourceComponent,
                    GeoJSONSourceComponent,
                    RasterSourceComponent,
                    ImageSourceComponent,
                    VideoSourceComponent,
                    CanvasSourceComponent,
                    FeatureComponent,
                    MarkerComponent,
                    PopupComponent,
                    ControlComponent,
                    FullscreenControlDirective,
                    NavigationControlDirective,
                    GeocoderControlDirective,
                    GeolocateControlDirective,
                    AttributionControlDirective,
                    ScaleControlDirective,
                    PointDirective,
                    ClusterPointDirective,
                    MarkerClusterComponent
                ]
            },] },
];

export { NgxMapboxGLModule, MAPBOX_API_KEY, MglResizeEventEmitter, MapService, MapComponent, AttributionControlDirective as ɵs, ControlComponent as ɵm, FullscreenControlDirective as ɵn, GeocoderControlDirective as ɵq, MAPBOX_GEOCODER_API_KEY as ɵp, GeolocateControlDirective as ɵr, NavigationControlDirective as ɵo, ScaleControlDirective as ɵt, DraggableDirective as ɵb, ImageComponent as ɵf, LayerComponent as ɵa, ClusterPointDirective as ɵv, MarkerClusterComponent as ɵw, PointDirective as ɵu, MarkerComponent as ɵe, PopupComponent as ɵl, CanvasSourceComponent as ɵk, FeatureComponent as ɵc, GeoJSONSourceComponent as ɵd, ImageSourceComponent as ɵi, RasterSourceComponent as ɵh, VectorSourceComponent as ɵg, VideoSourceComponent as ɵj };
//# sourceMappingURL=ngx-mapbox-gl.js.map
