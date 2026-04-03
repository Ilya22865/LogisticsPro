// Глобальные типы для Leaflet (подключается через CDN)
import 'leaflet';

export {};

declare global {
    namespace L {
        interface RoutingControlOptions {
            waypoints?: any[];
            routeWhileDragging?: boolean;
            geocoder?: any;
            language?: string;
        }

        interface RoutingControl {
            on(event: string, callback: (e: any) => void): this;
        }

        const Routing: {
            control(options: RoutingControlOptions): RoutingControl;
        };

        interface ControlConstructor {
            Geocoder?: {
                nominatim(): any;
            };
        }

        const Control: ControlConstructor;
    }
}
