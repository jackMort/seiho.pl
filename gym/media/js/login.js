Ext.namespace( 'seiho.gym' );

seiho.gym.Login = function() {
	return {
		init: function() {
			Ext.QuickTips.init();
			// ..
			if( this.loginDialog ) {
				return false;
			}

			this.loginDialog = new Ext.ux.form.LoginDialog({
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

Ext.onReady( seiho.gym.Login.init, seiho.gym.Login );
