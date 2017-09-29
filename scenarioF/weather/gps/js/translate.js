function translate (phrase) {
	if (LANG == 'en-CA' || LANG == '') {
		return phrase;
	} else {
		if (LANG_STRINGS[phrase] != undefined) {
			return LANG_STRINGS[phrase];
		} else {
			return '';
		}
	}
}
