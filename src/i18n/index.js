import {arrayEach} from './../helpers/array';
import {langDefinitionsController, DEFAULT_LANGUAGE_CODE} from './langDefinitionsController';
import {formattersController} from './formattersController';
import './languages/en';
import './languages/pl';
import './formatters/substituteVariables';
import './formatters/pluralize';

class LanguageController {
  static getSingleton() {
    return singleton;
  }

  constructor() {
    /**
     * Language code for specific locale i.e. 'en', 'pt', 'de'.
     *
     * @type {string}
     */
    this.languageCode = null;
    /**
     * Dictionary for specific language.
     *
     * @type {string}
     */
    this.langDefinition = null;

    this.setLocale(DEFAULT_LANGUAGE_CODE);
  }

  /**
   * Set actual locale.
   *
   * @param {string} languageCode Language code.
   */
  setLocale(languageCode) {
    this.languageCode = languageCode;
    this.langDefinition = langDefinitionsController.getDefinition(languageCode);
  }

  /**
   * Get formatted phrase from phrases propositions under constant.
   *
   * @param constant Dictionary key.
   * @param zippedVariableAndValue Object containing variables and corresponding to them values
   * which will be handled by formatters.
   *
   * @returns {string}
   */
  getPhrase(constant, zippedVariableAndValue) {
    let phrasePropositions = this.langDefinition[constant];

    arrayEach(formattersController.getFormatters(), (formatter) => {
      phrasePropositions = formatter(phrasePropositions, zippedVariableAndValue, this.languageCode);
    });

    return phrasePropositions;
  }
}

const singleton = new LanguageController();

export default singleton;
