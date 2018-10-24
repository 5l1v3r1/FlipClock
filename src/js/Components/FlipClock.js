import * as Faces from '../Faces';
import Face from '../Components/Face';
import List from '../Components/List';
import Group from '../Components/Group';
import Label from '../Components/Label';
import DomComponent from './DomComponent';
import validate from '../Helpers/Validate';
import Divider from '../Components/Divider';
import DefaultValues from '../Config/DefaultValues';
import ConsoleMessages from '../Config/ConsoleMessages';
import { isString, isObject, isFunction, error } from '../Helpers/Functions';

export default class FlipClock extends DomComponent {

    constructor(el, value, attributes) {
        if(!validate(el, HTMLElement)) {
            error(ConsoleMessages.element);
        }

        const face = attributes.face || DefaultValues.face;

        delete attributes.face;

        super(Object.assign({
            originalValue: value,
            theme: DefaultValues.theme,
            language: DefaultValues.language
        }, isObject(value) ? value : null, attributes));

        this.face = face;
        this.face.initialized(this);
        this.mount(el);
    }

    get face() {
        return this.$face;
    }

    set face(value) {
        if(!validate(value, [Face, 'string', 'function'])) {
            error(ConsoleMessages.face);
        }

        if(isString(value) && Faces[value]) {
            this.$face = new Faces[value](this.originalValue, this.getPublicAttributes());
        }
        else {
            this.$face = new value(this.originalValue, this.getPublicAttributes());
        }

        this.bindFaceEvents();
        this.el && this.render();
    }

    get stopAt() {
        return isFunction(this.$stopAt) ? this.$stopAt(this) : this.$stopAt;
    }

    set stopAt(value) {
        this.$stopAt = value;
    }

    get timer() {
        return this.face.timer;
    }

    set timer(value) {
        this.face.timer = value;
    }

    get value() {
        return this.face.value;
    }

    set value(value) {
        this.face.reset();
        this.face.value = value;
    }

    bindFaceEvents() {
        const fn = () => this.updated();

        this.$face.off('updated', fn).on('updated', fn);

        ['updated', 'start', 'stop', 'reset', 'interval'].forEach(event => {
            const fn = () => this.emit(event);

            this.face.off(event, fn).on(event, fn);
        });
    }

    updated() {
        this.render();

        if( this.stopAt !== undefined &&
            this.stopAt === this.face.value.value) {
            this.stop();
        }
    }

    mount(el) {
        super.mount(el);

        this.face.mounted(this);

        return this;
    }

    render() {
        this.face.rendered(super.render(), this);

        return this.el;
    }

    reset(fn) {
        this.face.reset(fn);

        return this;
    }

    start(fn) {
        this.face.start(fn);

        return this;
    }

    stop(fn) {
        this.face.stop(fn);

        return this;
    }

    createDivider(attributes) {
        return Divider.make(Object.assign({
            theme: this.theme,
            language: this.language
        }, attributes));
    }

    createList(value, attributes) {
        return List.make(value, Object.assign({
            theme: this.theme,
            language: this.language
        }, attributes));
    }

    createLabel(value, attributes) {
        return Label.make(value, Object.assign({
            theme: this.theme,
            language: this.language
        }, attributes));
    }

    createGroup(items, attributes) {
        return Group.make(items, Object.assign({
            theme: this.theme,
            language: this.language
        }, attributes));
    }

    static get defaults() {
        return DefaultValues;
    }

    static setDefaultFace(value) {
        validate(value, [Face, 'function']).then(() => {
            DefaultValues.face = value;
        }, () => {
            error(ConsoleMessages.face);
        });
    }

    static setDefaultTheme(value) {
        if(!validate(value, 'object')) {
            error(ConsoleMessages.theme);
        }

        DefaultValues.theme = value
    }

    static setDefaultLanguage(value) {
        if(!validate(value, 'object')) {
            error(ConsoleMessages.language);
        }

        DefaultValues.language = value;
    }

}
