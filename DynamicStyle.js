/**
 * Allows scripts to dynamically add, edit, and remove global CSS rules.
 *
 * Sample usage:
 * 	DynamicStyle.setStyle('activerow', 'tr#row-13 { background-color: yellow; }');
 * 	DynamicStyle.getStyle('activerow');
 * 	DynamicStyle.removeStyle('activerow');
 *
 * The technique (data: protocol in link element) was inspired by the testStyles bookmarklet on http://www.squarefree.com/bookmarklets/webdevel.html
 *
 * Requires: JQuery.js
 *
 * @version			0.5
 * @revision-date	2007-01-21
 * @license			cc-by-sa-2.5, GPL
 * @author			Tim McCormack
 * @author-url		http://www.brainonfire.net/
 */
function DynamicStyle()
{
	/**
	 * Version information, in the format major.minor
	 */
	this.version = '0.5';

	/*=================*
	 * Private Members *
	 *=================*/

	/**
	 * Browser-specific data and functions.
	 */
	var _BROWSER_SPEC =
	{
		'Opera':
		{
			name:'Opera',
			preData:'javascript:unescape(\'',
			postData:'\'',
			dataPrep:function(data) { return escape(data); }
		},

		'IE':
		{
			name:'Internet Explorer',
			preData:'javascript:unescape(\'',
			postData:'\')',
			dataPrep:function(data) { return escape(escape(data)); }
		},

		'Compliant':
		{
			name:'a compliant browser',
			preData:'data:text/css,',
			postData:'',
			dataPrep:function(data) { return escape(data); }
		}
	};

	/**
	 * One of the values inside _BROWSER_SPEC. For example, use _browser.dataPrep().
	 */
	var _browser = undefined;

	/**
	 * An associative array of styles, indexed by user-specified handle. This serves as a cache for the actual escaped style data in the _styleBlock.
	 *
	 * I'm using a cache because I can't rely on the validity of unescaped data.
	 */
	var _styles =
	{
//Example
//		'handle':
//		{
//			'element':<HTMLLinkElement>,
//			'style':'* { color: green; }'
//		}
	};

	/*===================*
	 * Private Functions *
	 *===================*/

	/**/
	/* Helper methods */
	/**/

	/**
	 * Checks whether the handle is acceptable.  An acceptable handle is considered sanitized.
	 */
	var validHandle = function(handle)
	{
		if( (handle !== undefined) && (handle !== null) && (typeof handle === 'string') && (handle.length > 0) && (handle.indexOf('/*') === -1) && (handle.indexOf('*/') === -1))
			return true;
		else
			return false;
	};

	/**
	 * Returns true if the handle is in use, false otherwise.
	 */
	var handleExists = function(san_handle)
	{
		return _styles[san_handle] !== undefined;
	};

	/**/
	/* DOM manipulation */
	/**/

	var createStyleElement = function(san_handle)
	{
		var block = document.createElement('link');
		block.setAttribute('rel', 'stylesheet');
		block.setAttribute('type', 'text/css');
		block.setAttribute('title', '\''+san_handle+'\' styles applied by dynamicstyle-'+DynamicStyle.version+'.js');
		document.getElementsByTagName('head')[0].appendChild(block);
		_styles[san_handle] = {'element':block, 'style':''};
	}

	/**/
	/* Backing store manipulation */
	/**/

	/**
	 * Copy the style data into the style cache object. You should then use commitStyleData() to save this information into the page.
	 */
	var recordStyleData = function(val_handle, style)
	{
		_styles[val_handle].style = style;
	};

	/**
	 * Fetch the cached version of the styles.
	 */
	var retrieveStyleData = function(val_handle)
	{
		return _styles[val_handle].style;
	};

	/**
	 * Removes the entire style entry. You SHOULD call destroyStyleElement first, otherwise you will lose your reference to the style node.
	 */
	var deleteStyleData = function(val_handle)
	{
		_styles[val_handle] = undefined;
	};

	/**
	 * Copies cached style data into the page. Generally used after recordStyleData().
	 */
	var commitStyleData = function(val_handle)
	{
		var block = _styles[val_handle];
		block.element.setAttribute('href', _browser.preData+_browser.dataPrep(block.style)+_browser.postData);
	};

	/**
	 * Remove the style element from the page and delete the reference to the element. Call this before calling deleteStyleData().
	 */
	var destroyStyleElement = function(val_handle)
	{
		var el = _styles[val_handle].element;
		el.parent.removeChild(el);
		_styles[val_handle].element = undefined;//de-ref
	};

	/**/
	/* Style block manipulation */
	/**/

	var createBlock = function(san_handle, style)
	{
		createStyleElement(san_handle);
		modifyBlock(san_handle, style);
	};

	var modifyBlock = function(val_handle, style)
	{
		recordStyleData(val_handle, style);
		commitStyleData(val_handle);
	};

	var retrieveBlock = function(val_handle)
	{
		return retrieveStyleData(val_handle);
	};

	var destroyBlock = function(val_handle)
	{
		destroyStyleElement(val_handle);
		deleteStyleData(val_handle);
	};

	/*====================*
	 * Privileged Methods *
	 *====================*/

	/**
	 * If the handle is new, the style wil be inserted, else, the new style will replace the old one.
	 */
	this.setStyle = function(handle, newStyle)
	{
		if(!validHandle(handle)) return false;

		if(handleExists(handle))
		{
			modifyBlock(handle, newStyle);
		}
		else
		{
			createBlock(handle, newStyle);
		}
	};

	/**
	 * Remove the style named by this handle.
	 */
	this.removeStyle = function(handle)
	{
		if(!validHandle(handle)) return false;

		if(handleExists(handle))
		{
			destroyBlock(handle);
		}
	};

	/**
	 * Retrieve the style named by this handle. (Unlikely to be needed.)
	 */
	this.getStyle = function(handle)
	{
		if(!validHandle(handle)) return false;

		if(handleExists(handle))
		{
			return retrieveBlock(handle);
		}
	};

	/*================*
	 * Initialization *
	 *================*/

	this.init = function()
	{
		//sniff for browser

		if(window.opera !== undefined) //Opera
		{
			_browser = _BROWSER_SPEC['Opera'];
		}
		else if(navigator.userAgent.indexOf("MSIE") >= 0) //IE
		{
			_browser = _BROWSER_SPEC['IE'];
		}
		else //Compliant user-agents (Mozilla, Safari, etc.)
		{
			_browser = _BROWSER_SPEC['Compliant'];
		}
	};

	this.constructor = undefined;//seal as a singleton
}

var DynamicStyle = new DynamicStyle();

$(document).ready(DynamicStyle.init);
