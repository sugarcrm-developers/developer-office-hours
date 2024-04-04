import customization from 'APP/js/core/customization';
import BaseAddressField from 'APP/js/fields/address/address.js';
import geolocation from 'APP/js/core/geolocation'

class CustomAddressField extends BaseAddressField {
    _radarApiKey = '<radar-apikey-goes-here>'

    events() {
        const baseEvents = super.events();

        return {
            ...baseEvents,
            'click .field': _.noop,
            'click .address-more': this.onClick,
            'click .address-dd__item': this.onPlaceClick,
            'keyup input': _.debounce(this.onSearch, 500)
        };
    }

    onSearch(e) {
        const query = e.target.value;

        if (query.length >= 3) {
            this.fetchAddress(query);
        }
    }

    async fetchAddress(query) {
        this.coords = this.coords ?? await this.getMyCoordinates();

        if (this._addressLoader) {
            app.api.abortRequest(this._addressLoader.requestId);
        }

        try {
            const params = new URLSearchParams([
                ['query', query],
                ['near', `${this.coords.latitude},${this.coords.longitude}`],
                ['limit', 5],
            ])
            const url = `https://api.radar.io/v1/search/autocomplete?${params.toString()}`;
            this._addressLoader = app.data.syncAsync({
                loader: {
                    method: 'read',
                    url,
                    apiOptions: {
                        headers: {
                            Authorization: this._radarApiKey,
                        }
                    },
                },
            });

            this.places = (await this._addressLoader).addresses;
            this.renderPlacesPopup(this.places);
        } catch (e) {
            console.error(e)
        } finally {
            this._addressLoader = null;
        }
    }

    onPlaceClick(e) {
        const index = $(e.target).data('index');

        if (!_.isNumber(index)) {
            return;
        }

        const place = this.places[index];
        this.setModelAddress(place);
        this.$el.find('.address-dd').html('');
    }

    setModelAddress(place) {
        const place2model = {
            billing_address_street: `${place.number} ${place.street}`,
            billing_address_city: place.city,
            billing_address_state: place.state,
            billing_address_postalcode: place.postalCode,
            billing_address_country: place.country,
        };

        this.model.set(place2model)
    }

    renderPlacesPopup(places) {
        const tpl = app.template.get('address-popup');
        this.$el.find('.address-dd').html(tpl({places}))
    }

    getMyCoordinates() {
        return new Promise((resolve, reject) => {
            geolocation.getCurrentPosition({
                successCb: position => resolve(position.coords),
                errorCb: reject,
                enableHighAccuracy: true,
            });
        });
    }
}

// Registering new address field without params will override default address field.
customization.register(CustomAddressField);

export default CustomAddressField;
