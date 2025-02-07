import { Plugin} from 'obsidian';
import { calclueMathModePlugin } from 'src/extensions/calclueMathModeDecorator.ts';

interface MyPluginSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
    mySetting: 'default'
}

export default class TheoremPlugin extends Plugin {
    settings: MyPluginSettings;

    async onload() {
        console.log('calclue plugin loaded2');
        await this.loadSettings();

        this.registerMarkdownPostProcessor((element, context) => {
            console.dir(element);
			console.dir(context);
            
        });

		console.log("calclueMathModePlugin:", calclueMathModePlugin);
		this.registerEditorExtension({ extension: calclueMathModePlugin });
		//this.registerEditorExtension([calclueMathModePlugin]);


		// Füge CSS für die Hervorhebung des Theorem-Blocks hinzu
    }


    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings); 
    }
}
