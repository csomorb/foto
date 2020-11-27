import { Component, ElementRef, OnInit, ViewChild, ɵConsole } from '@angular/core';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import View from 'ol/View';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import {transform, fromLonLat, get as getProjection} from 'ol/proj';
import {getWidth} from 'ol/extent';
import LayerGroup from 'ol/layer/Group';
import LayerTile from 'ol/layer/Tile';
import SourceOSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import SourceStamen from 'ol/source/Stamen';
import VectorSource from 'ol/source/Vector';
import {Icon, Style} from 'ol/style';
import Overlay from 'ol/Overlay';
import LayerSwitcher from 'ol-layerswitcher';
import { BaseLayerOptions, GroupLayerOptions } from 'ol-layerswitcher';
import { CategoryService } from 'src/app/services/category.service';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';


import {
  Circle as CircleStyle,
  Fill,
  Stroke,
  Text,
} from 'ol/style';
import OverlayPositioning from 'ol/OverlayPositioning';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  ignLayer: TileLayer;
  osmLayer: TileLayer;
  cyclOSMLayer: TileLayer;
  openTopoMapLayer: TileLayer;
  markerSource: VectorSource;
  markerLayer: VectorLayer;
  iconStyle: Style;
  map;
  @ViewChild('popup', { static: true }) popupElement: ElementRef;
  @ViewChild('map', { static: true }) mapElement: ElementRef;
  @ViewChild('popupContent', { static: true }) popupContentElement: ElementRef;
  photoBaseUrl: string = environment.apiUrl;

  constructor(private catService: CategoryService, private apiService: ApiService,
    private toast: ToastrService) {

    let resolutions = [];
    let matrixIds = [];
    let proj3857 = getProjection('EPSG:3857');
    let maxResolution = getWidth(proj3857.getExtent()) / 256;

    for (let i = 0; i < 18; i++) {
      matrixIds[i] = i.toString();
      resolutions[i] = maxResolution / Math.pow(2, i);
    }


    const tileGrid = new WMTSTileGrid({
      origin: [-20037508, 20037508],
      resolutions: resolutions,
      matrixIds: matrixIds,
    });


    // For more information about the IGN API key see
    // https://geoservices.ign.fr/blog/2017/06/28/geoportail_sans_compte.html


    const ignSource = new WMTS({
      url: 'https://wxs.ign.fr/pratique/geoportail/wmts',
      layer: 'GEOGRAPHICALGRIDSYSTEMS.MAPS',
      matrixSet: 'PM',
      format: 'image/jpeg',
      projection: 'EPSG:3857',
      tileGrid: tileGrid,
      style: 'normal',
      attributions:
        '<a href="http://www.ign.fr" target="_blank">' +
        '<img src="https://wxs.ign.fr/static/logos/IGN/IGN.gif" title="Institut national de l\'' +
        'information géographique et forestière" alt="IGN"></a>',
    });

    this.ignLayer = new TileLayer({
      title: 'IGN',
      visible: true,
      type: 'base',
      source: ignSource,
    } as BaseLayerOptions);

    this.osmLayer = new LayerTile({
      title: 'OSM',
      type: 'base',
      visible: true,
      source: new SourceOSM()
    } as BaseLayerOptions);

    this.cyclOSMLayer = new LayerTile({
      title: 'Cyclo',
      visible: true,
      type: 'base',
      maxZoom: 20,
      source: new XYZ({
        url: 'https://{a-c}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
        attributions: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })
    } as BaseLayerOptions);

    this.openTopoMapLayer = new LayerTile({
      title: 'OpenTopoMap',
      visible: true,
      type: 'base',
      maxZoom: 17,
      source: new XYZ({
        url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attributions: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      })
    } as BaseLayerOptions);

    this.markerSource = new VectorSource({
      features: [],
    });

    this.markerLayer = new VectorLayer({
      source: this.markerSource,
    });

    this.iconStyle = new Style({
      image: new Icon({
        src: '/assets/icon/marker.svg',
       anchor: [0.5, 1],
        scale: 0.5
      })
    });


  }



  ngOnInit(): void {
    this.map = new Map({
      target: 'map',
      view: new View({
        zoom: 5,
        center: fromLonLat([5, 45]),
      }),
    });



    const baseMaps = new LayerGroup({
      title: 'Fond de carte',
      layers: [this.osmLayer, this.ignLayer, this.cyclOSMLayer, this.openTopoMapLayer]
    } as GroupLayerOptions);



    this.map.addLayer(baseMaps);
    this.map.addLayer(this.markerLayer);

    const layerSwitcher = new LayerSwitcher({
      reverse: true,
      groupSelectStyle: 'none'
    });

    this.map.addControl(layerSwitcher);

    this.catService.markers.subscribe(markers => {
      this.markerSource.clear();
      for (let i = 0; i < markers.length; i++){
        let iconFeature = new Feature({
          geometry: new Point(fromLonLat([markers[i].long,markers[i].lat])),
          title: markers[i].title,
          src320: markers[i].src320
        });
        iconFeature.setStyle(this.iconStyle);
        this.markerSource.addFeature(iconFeature);
      }
      if (markers.length){
        if(markers.length === 1){
          this.map.getView().animate({zoom: 13}, {center: fromLonLat([markers[0].long,markers[0].lat])});
        }
        else{
          this.map.getView().fit(this.markerSource.getExtent(), {padding: [50,0,0,0], duration: 1000});
        }
      }
    })

    let popup = new Overlay({
      element: this.popupElement.nativeElement,
      positioning: 'bottom-center' as OverlayPositioning,
      stopEvent: false,
      offset: [0, -50],
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });
    this.map.addOverlay(popup);

    this.map.on('click', (evt) => {
      if(this.catService.geoTagMode){
        const longlat = transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        this.catService.selectedCoordinates.next(longlat);
      }
      else{
        let feature = this.map.forEachFeatureAtPixel(evt.pixel, function (feature) {
          return feature;
        });
        if (feature) {
          let coordinates = feature.getGeometry().getCoordinates();
          popup.setPosition(coordinates);
          console.log(feature);
          this.popupElement.nativeElement.innerHTML = '<img src="'+ this.photoBaseUrl + feature.values_.src320 + '" /><div class="title-overlay">'+ feature.values_.title+'</div>';
          this.map.getView().fit(feature.getGeometry(), {padding: [150,10,0,10], duration: 1000, minResolution: 10});

        }
        else{
          popup.setPosition(undefined);
        }
      }
    });



    // change mouse cursor when over marker
    this.map.on('pointermove', (e) => {
      if (e.dragging) {
        return;
      }
      if(this.catService.geoTagMode){
        this.mapElement.nativeElement.style.cursor = "url('/assets/icon/plus.svg') 32 32,auto";
      }
      else{
        var pixel = this.map.getEventPixel(e.originalEvent);
        var hit = this.map.hasFeatureAtPixel(pixel);
        this.mapElement.nativeElement.style.cursor = hit ? 'pointer' : '';
      }
    });

  }

}
