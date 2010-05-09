Ext.namespace( 'seiho.gym' );

seiho.gym.App = function() {
	return {
		init: function() {
			Ext.QuickTips.init();

			// lokalizacja użytkownika
			Ext.get( 'user-location' ).on( 'click', this.shareLocation, this);

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
		},
		shareLocation: function( e, t ) {			
			e.preventDefault();
		
			if( this.shareLocationWindow ) {
				this.shareLocationWindow.toFront();
				this.shareLocationWindow.getEl().frame();

				return false;
			}

			this.shareLocationWindow = new Ext.Window({
				layout: 'fit',
				iconCls: 'icon-map',
				title: 'Twoja lokalizacja',
				modal: true,
				width: 600,
				height: 200,
				x: e.getXY()[0] - 600,
				y: e.getXY()[1] + 35,
				items: new Ext.ux.GMapPanel({
					listeners: {
						render: {
							fn: function( panel ) {
								panel.getEl().mask( 'Trwa pobieranie danych o lokacji ...', 'x-mask-loading' );
								// ..
								if ( navigator.geolocation ) {
									navigator.geolocation.getCurrentPosition( function( pos ) {
										var point = new GLatLng( pos.coords.latitude, pos.coords.longitude );
										// ..
										panel.getMap().setCenter( point, 13 )
										panel.addMarker( point, { title: 'Tu jesteś koksie ...' } )
										// ..
										panel.getEl().unmask();
									});
								}
							},
							delay: 2000						
						}
					},
					xtype: 'gmappanel',
					zoomLevel: 5,
					gmapType: 'map',
					mapConfOpts: ['enableScrollWheelZoom', 'enableDoubleClickZoom', 'enableDragging' ],
					mapControls: ['GSmallMapControl', 'GmapTypeControl', 'NonExistantControl'],
					setCenter: {
						lat: 52,
						lng: 19
					}
				}),
				listeners: {
					close: {
						fn: function() {
							this.shareLocationWindow = undefined
						},
						scope: this
					}
				}
			}).show( t )			
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
					items: [
						new Seiho.gym.exercise.MainPanel(),
						new Seiho.gym.profile.MainPanel()
					]
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
