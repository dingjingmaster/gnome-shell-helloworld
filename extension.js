/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const GETTEXT_DOMAIN = 'my-indicator-extension';

const { GObject, St } = imports.gi;

const Gettext = imports.gettext.domain(GETTEXT_DOMAIN);
const _ = Gettext.gettext;
const Lang = imports.lang;
const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Tweener = imports.tweener.tweener;
const Atk = imports.gi.Atk;

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        this.name = "example";
        super._init(0.0, _('My Shiny Indicator'));
        this.actor.accessible_role = Atk.Role.TOGGLE_BUTTON;

        this._text = null;
        this._icon = new St.Icon({ icon_name: 'system-run-symbolic',
                                 style_class: 'system-status-icon' });

        this.actor.add_child(this._icon);
        this.actor.connect('button-press-event', Lang.bind(this, this._showHello));
    }

    _hideHello () {
      Main.uiGroup.remove_actor(this._text);
      this._text = null;
    }

    _showHello () {
      if (!this._text) {
        this._text = new St.Label({ style_class: 'helloworld-label', text: "Hello, world!" });
        Main.uiGroup.add_actor(this._text);
      }
      this._text.opacity = 255;

      let monitor = Main.layoutManager.primaryMonitor;

      this._text.set_position(monitor.x + Math.floor(monitor.width / 2 - this._text.width / 2),
                      monitor.y + Math.floor(monitor.height / 2 - this._text.height / 2));

      Tweener.addTween(this._text,
                     { opacity: 0,
                       time: 2,
                       transition: 'easeOutQuad',
                       onComplete: this._hideHello });
      }
});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;

        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
