Ext.namespace( 'seiho.gym' );

seiho.gym.App = function() {
	return {
		init: function() {
			Ext.QuickTips.init();
			
			// mapowoania akcji ...
			new Ext.KeyMap( document, {
				alt: true,
				key: Ext.EventObject.ENTER,
				fn: this.login,
				scope: this
			});

			// wyszukiwarka ...
	//		this.searchField = new Ext.form.TextField({
	//			renderTo: 'search',				
	//			width: 200,
	//			emptyText: 'wyszukaj w serwisie ...'
	//		});

			// panel centralny
			var viewport = new Ext.Viewport({
				layout: 'border',
				items: [
					{
						contentEl: 'header',
						region: 'north',
						height: 60,
						border: false,
						bodyStyle: 'background: #e5e5e5',
					},{
						region: 'center',
						layout: 'fit',
						border: false,
						bodyStyle: 'background: #e5e5e5',
						items: new seiho.gym.MainPanel()
					}
				]
			})
		},

		login: function() {
			if( this.loginDialog ) {
				return false;
			}

			this.loginDialog = new Ext.ux.form.LoginDialog({
				modal : true,
                url : '/json/login',
				forgotPasswordLink : '/lost_password',
				cancelButton: 'Zamknij',
				basePath: '/media/js/lib/logindialog/img/icons',
 			    message : 'Aby kontynuować musisz się zalogować.' +
				'<br />Podaj login i hasło.',
				usernameLabel: 'Login',
				passwordLabel: 'Hasło',
				forgotPasswordLabel: 'Zapomniałeś hasła ?',
				rememberMeLabel: 'Zapamiętaj mnie',
				title: 'Logowanie do systemu',
				loginButton: 'Zaloguj',
				enableVirtualKeyboard: true,
				listeners: {
					cancel: {
						fn: function() {
							this.loginDialog = undefined;
						},
						scope: this
					}
				}				
			});

			this.loginDialog.show();
		}		
	}
}();


seiho.gym.MainPanel = Ext.extend( Ext.Panel, {
	border: false,
	initComponent: function() {
		Ext.apply( this, {
			frame: true,
			baseCls: 'canvas',
			tbar: [
				{
					xtype: 'buttongroup',
					title: 'Projekt',
					defaults: {
						iconAlign: 'top'
					},
					items: [
						{ iconCls: 'icon-save', text: 'zapisz', scope: this },	
						{ iconCls: 'icon-delete', text: 'wyczyść', scope: this },
						{ iconCls: 'icon-application_osx_terminal', text: 'szablon', disabled: true },						
						{ iconCls: 'icon-map', text: 'mapa', disabled: true }
					]
				},
				{
					xtype: 'buttongroup',
					title: 'Edycja',
					defaults: {
						iconAlign: 'top'
					},
					items: [
						{ iconCls: 'icon-arrow_turn_left', text: 'cofnij', disabled: true },	
						{ iconCls: 'icon-arrow_turn_right', text: 'ponów', disabled: true }
					]
				}
			]	
		});
		seiho.gym.MainPanel.superclass.initComponent.apply( this, arguments );
	}
});

Ext.onReady( seiho.gym.App.init, seiho.gym.App );
