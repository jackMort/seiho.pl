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
					},
					success: function() {
						location = '/'
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
			layout: 'fit',
			items: [
				new Ext.TabPanel({
					activeItem: 0,
					items: new Seiho.gym.exercise.MainPanel()
				})
			],
			gbar: [
				' ', { iconCls: 'icon-book_open', text: 'dziennik treningowy', pressed: true, toggleGroup: 'main-bar' },
				// { iconCls: 'icon-delete', text: 'wyczyść', toggleGroup: 'main-bar' }, '-', 
				// { iconCls: 'icon-application_osx_terminal', text: 'szablon', toggleGroup: 'main-bar' },
				// { iconCls: 'icon-map', text: 'mapa', toggleGroup: 'main-bar', disabled: 'true' }, 
				'->', { xtype: 'textfield', width: 200, emptyText: 'Wyszukaj w serwisie ...' },' '
			]
		});
		seiho.gym.MainPanel.superclass.initComponent.apply( this, arguments );
	}
});

Ext.onReady( seiho.gym.App.init, seiho.gym.App );
