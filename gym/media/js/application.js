Ext.namespace( 'seiho.gym' );

seiho.gym.App = function() {
	return {
		init: function() {
			Ext.QuickTips.init();

			new Ext.KeyMap( document, {
				alt: true,
				key: Ext.EventObject.ENTER,
				fn: this.login,
				scope: this,
			});
		},

		login: function() {
			if( this.loginDialog ) {
				return false;
			}

			this.loginDialog = new Ext.ux.form.LoginDialog({
				modal : true,
				forgotPasswordLink : '/lost_password',
				cancelButton: 'Zamknij',
				basePath: '/media/js/lib/logindialog/img/icons',
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

Ext.onReady( seiho.gym.App.init, seiho.gym.App );
