const getBorderWidth = (borderPosition, borderWidth) => {
  switch (borderPosition) {
    case 'a':
      return `${borderWidth}px ${borderWidth}px ${borderWidth}px ${borderWidth}px`
    case 'b':
      return `0 0 ${borderWidth}px 0`
    case 'l':
      return `0 0 0 ${borderWidth}px`
    case 'r':
      return `0 ${borderWidth}px 0 0`
    case 't':
      return `${borderWidth}px 0 0 0`
    case 'x':
      return `0 ${borderWidth}px 0 ${borderWidth}px`
    case 'y':
      return `${borderWidth}px 0 ${borderWidth}px 0`
  }
}

const setCssVars = (theme) => {
  Object.entries(theme).forEach(([ key, value ]) => {
    if ('inputBorderPosition' === key) {
      value = getBorderWidth(value, theme.inputBorderWidth)
    }

    if ('sectionBorderPosition' === key) {
      value = getBorderWidth(value, theme.sectionBorderWidth)
    }

    if ([
      'bodyFontSize',
      'descriptorLabelFontSize',
      'inputBorderWidth',
      'inputLabelFontSize',
      'sectionBorderWidth',
      'sectionPrimaryTitleFontSize',
      'sectionSecondaryTitleFontSize',
      'separatorWeight',
      'sfxLabelFontSize',
      'subTraitLabelFontSize',
      'traitSubTitleFontSize',
      'traitTitleFontSize'
    ].includes(key)) {
      value = `${value}px`
    }

    if (['sheetBackgroundImage', 'sectionBackgroundImage'].includes(key)) {
      value = value
        ? value.startsWith('http')
          ? `url('${value}')`
          : `url('/${value}')`
        : 'none'
    }

    const property = `--${key.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase())}`

    document.body.style.setProperty(property, value)
  })
}

async function importXadiaSettings() {
	const installed = await game.settings.get("cortex-tales-of-xadia-theme", "themeInstalled")
	if (installed) {
		console.log("Tales of Xadia Theme already installed. Have fun!")
		return
	}
	console.log("Installing Tales of Xadia settings.")
	await game.settings.set("cortex-tales-of-xadia-theme", "themeInstalled", true)
	
	const settingsFile = await fetch("modules/cortex-tales-of-xadia-theme/tales-of-xadia-settings.json")
	const settings = await settingsFile.json()
	
	if (!settings?.cortexPrimeVersion && !settings?.actorTypes) {
		console.error("Invalid settings! Missing cortexPrimeVersion or actorTypes!")
		console.log("Settings = ", settings)
		return
	} 
	
	if (game.system.data.version !== settings?.cortexPrimeVersion) {
		console.error("Incompatible version of cortex prime.")
		return
	}
	
	await game.settings.set("cortexprime", "importedSettings", { currentSetting: "tales-of-xadia-theme" })
	await game.settings.set("cortexprime", "actorTypes", settings.actorTypes)
	
	const themeSettings = await game.settings.get("cortexprime", "themes")
	const { current, custom } = settings.theme ?? {}
	
	themeSettings.current = "Tales of Xadia Theme"
	themeSettings.list["Tales of Xadia Theme"] = custom
	
	await game.settings.set("cortexprime", "themes", themeSettings)
	
	const theme = themeSettings.list["Tales of Xadia Theme"]
	setCssVars(theme)
	console.log("Installed Tales of Xadia Settings!")
}

Hooks.on("init", function() {
	game.settings.register("cortex-tales-of-xadia-theme", "themeInstalled", {
		name: "Theme Installed",
		hint: "A flag indicating that the module was installed",
		scope: "world",
		config: false,
		type: Boolean,
		default: false,
		onChange: value => {
			console.log("themeInstalled changed to ", value)
		}
	})
})

Hooks.on("ready", function() {
    importXadiaSettings()
})
