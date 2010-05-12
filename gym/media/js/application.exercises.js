Ext.namespace( 'Seiho.gym.exercise' );

Seiho.gym.exercise.MainPanel = Ext.extend( Ext.grid.GridPanel, {
	initComponent: function() {

		var xg = Ext.grid;

		var experienceStore = new Ext.data.GroupingStore({
			groupField: 'date',
			proxy: new Ext.data.DirectProxy({
				directFn: django.exercises.list
			}),
			reader: new Ext.data.JsonReader({
				root: 'records',
				fields: [
					{name: 'id'},
					{name: 'template_name'},
					{name: 'template_type'},
					{name: 'sets'},
					{name: 'date', type: 'date', dateFormat: 'Y-m-d h:i:s'},
				]
			})
		});

		Ext.apply( this, {
			store: experienceStore,
			loadMask: { msg: 'Czekaj <b>koksie</b>, trwa wczytywanie twoich treningów ...'},
			columns: [
				{
					id:'tn',
					header: "Nazwa", 
					sortable: true, 
					dataIndex: 'template_name',  
					renderer: function( v ) {
						// TODO wygląd
						return v
					}
				},
				{header: "Typ", width: 20, sortable: true, dataIndex: 'template_type', align: 'center' },				
				{
					header: "Serie", 
					width: 5, 
					sortable: true, 
					dataIndex: 'sets',
					align: 'center',
					renderer: function( v ) { 
						var sets = Ext.util.JSON.decode( v );
						return '<div class="round-corners" style="background: #cccccc; font-weight: bold; color: white">' + sets.length + '</div>'
					}
				},
				{header: "Data", width: 20, align: 'center', sortable: true, renderer: Ext.util.Format.dateRenderer( 'l, j F Y' ), dataIndex: 'date'}
			],

			view: new Ext.grid.GroupingView({
				emptyText: 'Brak danych treningowych. Zacznij ćwiczyć ...',
				forceFit:true,
				hideGroupedColumn: true,
				groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Elementów" : "Element"]})',
				enableRowBody: true,
				showPreview: true,
				getRowClass: function( record, rowIndex, rp, ds ) {
					if( this.showPreview ) {
						var sets = Ext.util.JSON.decode( record.get( 'sets' ) );
						// TODO: template
						var items = '';
						for( var i = 0, len = sets.length; i < len; i++ ) {
							var mass = sets[i].fields.mass;
							var time = sets[i].fields.time;
							var reps = sets[i].fields.reps;
							var number = sets[i].fields.number;
							var distance = sets[i].fields.distance;
	
							var info = ( reps > 0 ? '<span class="biggest">' + reps + '</span> powtórzeń' : '' ) + ( mass > 0 ? ' x <span class="biggest">' + mass + '</span> kg ' : '' ) + ( distance > 0 ? ' <span class="biggest">' + distance + '</span> m' : '' ) + ( time != '00:00:00' ? ' <span class="biggest">' + time + '</span>' : '' )
	
							items += '<div class="set round-corners"><span class="number round-corners">' + number + '</span> ' + info + '</div>'
						}
	
						rp.body = '<div class="exercise-bodyrow">' + items + '</div>'
					}
					return 'x-grid3-row-expanded'
				}
			}),
			title: 'Dziennik treningowy',
			iconCls: 'icon-grid',
			tbar: [
				' ', { xtype: 'textfield', width: 250, emptyText: 'Wyszukaj w dzienniku ...' },
				'->', 
				{ iconCls: 'icon-page_white', text: 'dodaj', handler: this.addExercise, scope: this }, '-', 
				{ iconCls: 'icon-page_white_edit', text: 'edytuj', disabled: true },
				{ iconCls: 'icon-delete', text: 'usuń', disabled: true },
				'-',
				{ iconCls: 'icon-common', text: 'szczegóły serii', enableToggle: true, pressed: true, toggleHandler: this.toggleSeries, scope: this },
				' '
			]
		});

		Seiho.gym.exercise.MainPanel.superclass.initComponent.apply( this, arguments );
		
		this.on( 'render', function() {
			experienceStore.load()			
		}, this, { delay: 100 } );
	},
	toggleSeries: function( btn, pressed ) {
		var view = this.getView();
		view.showPreview = pressed;
		view.refresh();
	},
	addExercise: function() {
		if( this.window ) {
            this.window.toFront();
			this.window.getEl().frame();

            return false;
        }

        var form = new Seiho.gym.exercise.TrainingWizard({
            listeners: {
                validate: {
                    fn: function (form, valid, item, items_len) {
                        // set disabled when not valid or not last
                        this.window.buttons[2].setDisabled(!valid || !(item == items_len));
                    },
                    scope: this
                }
            }
        });

        this.window = new Seiho.Window({
            form: form,
            // ..
            title: 'Nowy Trening ...',
			iconCls: 'icon-page_white',
            maxWidth: 900,
            maxHeight: 500,
            layout: 'fit',
            items: form,
            listeners: {
                close: {
                    fn: function () {
                        this.window = undefined;
                    },
                    scope: this
                }
            },
            buttons: [
            	form.prevPanelAction, form.nextPanelAction, {
                	text: 'Zapisz',
	                iconCls: 'icon-save',
    	            handler: this.saveTraining.createDelegate( this )
	            },
    	        {
        	        text: 'Anuluj',
	                iconCls: 'icon-delete',
    	            handler: function () {
        	            this.window.close()
            	    },
                	scope: this
	            }]
        });
        this.window.show();
	},
	deleteExercise: function() {
		// TODO implementacja
	},
	saveTraining: function( withoutConfirm ) {
		var form = this.window.form;		
		if( withoutConfirm == true ) {
			//this.window.getEl().mask( 'Trwa przesyłanie danych na serwer, <b>Jak byś tyle nie cisnął to by to trwało szybciej</b> ...', 'x-mask-loading' );
		   	django.exercises.save( Ext.util.JSON.encode( form.getValues() ), function( e ) {
		   		console.log( e )
		   	});
			return false;
		}

		Ext.Msg.show({
			title  : 'Zapis treningu',
			icon   : Ext.MessageBox.QUESTION,
			msg    : 'Czy na pewno chcesz zapisać ten trening ?',
			buttons: Ext.Msg.YESNO,
			fn     : function( btn ){
				if( btn == 'yes' ) {
					// sleep a litle to wait for close this confirm window
					this.saveTraining.defer( 1, this, [true] );
				}
			},			
			scope  : this
		});
	}
});

Seiho.gym.exercise.TrainingWizard = Ext.extend( Seiho.wizard.BaseWizard, { //{{{
    initComponent: function () {
        Ext.apply(this, {
            items: [
	            new Seiho.gym.exercise.TrainingWizard.BaseInfo({
				    wizard: this
				}),
	            new Seiho.gym.exercise.TrainingWizard.Exercises({
				    wizard: this
			    }),
			]
        });
        Seiho.gym.exercise.TrainingWizard.superclass.initComponent.apply(this, arguments);
    }
});
//}}}
Seiho.gym.exercise.TrainingWizard.BaseInfo = Ext.extend( Seiho.wizard.Item, { //{{{
    startDate: new Date().clearTime(),
    stepName: 'Podstawowe dane o treningu',
    stepRawName: 'base_info',
    stepDescription: 'Uzupełnij podstawowe dane o treningu.',
    initComponent: function () {

        this.nameField = new Ext.form.TextField({
			name: 'name',
			flex: 1,
			allowBlank: false,
            value: 'Ćwiczenia na przedłużenie członka ' + new Date().format('Y-m-d H:i:s'),
            listeners: {
                blur: this.validate.createDelegate(this)
            }
		});
 
		this.dateField = new Ext.form.DateField({
            name: 'date',
			allowBlank: false,
            value: this.startDate,
            listeners: {
                blur: this.validate.createDelegate(this)
            }
		});
	
		this.privateField = new Ext.form.Checkbox({
			name: 'private',
			fieldLabel: 'Prywatny',
			allowBlank: false,
			anchor: '100%'
        });

		this.baseElement = new Ext.FormPanel({
			autoScroll: true,
            border: false,
            bodyStyle: 'padding:25px 20px 0px 20px',
            //margins: '3 3 3 3',
            items: [{
                xtype: 'fieldset',
                title: 'Dane ewidencyjne',
                autoHeight: true,
				items: [
					{
						xtype: 'compositefield',
						fieldLabel: 'Nazwa, Data',
						anchor: '-10px',
						items: [
							this.nameField,
							this.dateField
						]
					},
					this.privateField
				]
            },{
                xtype: 'fieldset',
                title: 'Opis, Uwagi',
                autoHeight: true,
                layout: 'fit',
                items: {
                    xtype: 'textarea',
                    name: 'description',
                    height: 200,
                    hideLabel: true,
                    listeners: {
                        blur: this.validate.createDelegate( this )
                    }
                }
            }]
        });
        Seiho.gym.exercise.TrainingWizard.BaseInfo.superclass.initComponent.apply( this, arguments );
    },

    isValid: function () {
        return this.baseElement.getForm().isValid()
    },

    getValues: function () {
        return this.baseElement.getForm().getValues();
    }

});
//}}}
Seiho.gym.exercise.TrainingWizard.Exercises = Ext.extend( Seiho.wizard.Item, { //{{{
    stepName: 'Ćwiczenia w sesji treningowej',
    stepRawName: 'exercises',
    stepDescription: 'Wybierz ćwiczenia wykonane w tej sesji treningowej.',
    initComponent: function () {

		this.dropPanel = new Seiho.gym.exercise.TrainingWizard.Exercises.DropPanel({
			region: 'center',
			margins: '1 1 1 1'
		})

		this.baseElement = new Ext.Panel({
			border: false,
			layout: 'border',
			bodyStyle: 'background: white', 
			items: [
				this.dropPanel, new Seiho.gym.exercise.TrainingWizard.Exercises.Toolbox({
					region: 'west',
					width: 300,
					border: false,
					margins: '1 1 1 1'
				})
			]
		});
	
		this.buttonClear = new Ext.Button({
			disabled: true,
			text: 'Wyczyść',
			iconCls: 'icon-world_delete',
			handler: this.clear,
			scope: this
		});

		Ext.apply( this, {
			fbar: [
				'->', this.buttonClear, ' '
			]
		});

		Seiho.gym.exercise.TrainingWizard.Exercises.superclass.initComponent.apply( this, arguments );
		
		this.dropPanel.store.on( 'update', this.updateButtons, this )
		this.dropPanel.store.on( 'remove', this.updateButtons, this )
		this.dropPanel.store.on( 'add'   , this.updateButtons, this )
    },

	isValid: function () {		
		var items = this.dropPanel.store.data.items;
		if( items.length == 0 ) return false;
		for( var i = 0, len = items.length; i < len; i++ )
			if( items[i].data.series.length == 0 )
				return false

		return true
    },

	getValues: function () {
		var r = []
		this.dropPanel.store.each( function( item ) {
			r.push( item.data )
		});

		return r;
	},
	clear: function() {
		this.dropPanel.store.removeAll();
	},
	updateButtons: function() {
		this.validate();
		// ..
		this.buttonClear.setDisabled( this.dropPanel.store.getCount() == 0 )
	}

});
//}}}

Seiho.gym.exercise.TrainingWizard.Exercises.Toolbox = Ext.extend( Ext.tree.TreePanel, {
	rootVisible: false,
	autoScroll: true,
	useArrows: true,
	enableDrag: true,
	collapseFirst: false,
	trackMouseOver: false,
	ddGroup: 'designer-canvas',
	initComponent: function() {
		this.loader = new Ext.tree.TreeLoader({
			directFn: django.templates.tree
		});
		this.root = {
			id: "troot",
			async: true,
			expanded: true,
			text: "troot"
		};

		Seiho.gym.exercise.TrainingWizard.Exercises.Toolbox.superclass.initComponent.call( this );
		this.getSelectionModel().on( 'beforeselect', function( a, b ) {
			if( b && !b.isLeaf() ) {
				b.toggle();
				return false
			}
		});
	}
});

Seiho.gym.exercise.TrainingWizard.Exercises.DropPanel = Ext.extend( Ext.Panel, {
	baseCls: 'canvas',
	frame: true,
	// TODO: wszystko do css'a
	tpl: new Ext.XTemplate(
		'<tpl for=".">',
			'<div class="exercise round-corners" style="margin: 5px; background: #ccd9e8; border: 1px solid #99bbe8; padding: 2px;min-height: 45px; -moz-box-shadow: 2px 2px 2px #ccc;">',
			'<div class="exercise-del x-tool x-tool-close"></div>',
			'<div class="exercise-add x-tool x-tool-plus"></div>',
			'<div class="exercise-name" style="padding: 2px; font-weight: bold; color: #15428b; font: normal 12px tahoma,arial,helvetica,sans-serif;">{text}</div>',
				'<div class="exercise-series">',
					'<tpl for="series">',
						'<div class="set round-corners"><span class="number round-corners">{[xindex]}</span>{text}</div>',
					'</tpl>',
				'</div>',
			'</div>',
		'</tpl>'
	),
	initComponent: function() {
		this.record = Ext.data.Record.create([
			{ name: 'id', type: 'int' },
			{ name: 'text' },
			{ name: 'series' }
		]);

		this.store = new Ext.data.Store({
			reader: new Ext.data.ArrayReader(
				{
					idIndex: 0
				},
				this.record
			)
		});

	   Ext.apply( this, {
		layout: 'fit',
		items: this.dataView = new Ext.DataView({
			store: this.store,
			tpl: this.tpl,
			autoScroll: true,
			emptyText: '<div class="empty-text" style="text-align: center; color: #999999; margin-top: 10px; padding: 3px; font-size: 1.2em;">Brak ćwiczeń, dodaj ćwiczenie przeciągając je z panelu po lewej stronie</div>',
		   	itemSelector: 'div.exercise'
		})
	   })

		Seiho.gym.exercise.TrainingWizard.Exercises.DropPanel.superclass.initComponent.apply( this, arguments )

		this.on( 'render', function() {
			var self = this;
			this.dropZone = new Ext.dd.DropTarget( this.body.dom, {
				ddGroup: 'designer-canvas',
				notifyDrop: function( ddSource, e, data ) {
					self.addExercise( data.node )
		
					return true
				}
			})
		}, this )

		this.dataView.on( 'click', this.onNodeClick, this );
		this.dataView.on( 'contextmenu', this.onNodeContextMenu, this );
		
	},
	
	addExercise: function( node ) {
		var record = new this.record(
			{ 
				id: node.attributes.id, 
			  	text: node.attributes.text, 
				series: []
		  	}
		);
		
		this.store.add( 
			record
		);

		this.addSerie( record );
	},
	onNodeClick: function( dv, index, node, e ) {
		e.preventDefault();
		
		var record = dv.getRecord( node );
		if( e.getTarget( '.exercise-del' ) ) {
			this.removeExercise( record )
		} else if( e.getTarget( '.exercise-add' ) ) {
			this.addSerie( record )
		}  
	},
	onNodeContextMenu: function( dv, index, node, e ) {
		e.preventDefault();
		
		var record = dv.getRecord( node );
		var set = e.getTarget( '.set' );
		
		if( set ) {
			// TODO: menu dla serii
		} else {

			var items = [
				{ text: 'dodaj serię', iconCls: 'icon-page_white_add', handler: this.addSerie.createDelegate( this, [record] ) },
			];

			if( record.get( 'series' ).length > 0 ) {
				var menu = [];
				Ext.each( record.get( 'series' ), function( item, serieIdx ) {
					menu.push(					
						{ text: item.text , iconCls: 'icon-page_white', handler: this.removeSerie.createDelegate( this, [record, serieIdx ] ) }
					);
				}, this ); 

				items.push(
					{ text: 'usuń serię', iconCls: 'icon-page_white_delete', menu: menu }
				);
			}

			items.push( 
				[
					'-', { text: 'usuń to ćwiczenie', iconCls: 'icon-cross', handler: this.removeExercise.createDelegate( this, [record] ) }
				]
			);

			var menu = new Ext.menu.Menu({
				items: items	
			});

			menu.showAt( e.getXY() )
		}
	},
	removeExercise: function( record ) {
		this.store.remove( record );
	},
	addSerie: function( record ) {
		if ( this.window != undefined ) {
            this.window.toFront();
			this.window.getEl().frame();

            return false;
		}
		
		this.window = new Seiho.gym.exercise.TrainingWizard.Exercises.SerieForm().getWindow({
			title: 'Nowa Seria',
			iconCls: 'icon-page_white',
            listeners: {
                close: {
                    fn: function () {
                        this.window = undefined;
                    },
                    scope: this
                }
			},
			buttons: 
				[
					{
						text   : 'Zapisz',
						iconCls: 'icon-save',
						handler: function() {
							var form = this.window.form.getForm();
							if( !form.isValid() ) {
								return false;
							}
							var values = form.getValues()
							var reps = values.reps;
							var mass = values.mass;
							var distance = values.distance;
							var time = values.time;

							var text = ( reps > 0 ? '<span class="biggest">' + reps + '</span> powtórzeń' : '' ) + ( mass > 0 ? ' x <span class="biggest">' + mass + '</span> kg ' : '' ) + ( distance > 0 ? ' <span class="biggest">' + distance + '</span> m' : '' ) + ( time != '00:00:00' ? ' <span class="biggest">' + time + '</span>' : '' )

							var series = record.get( 'series' );
							series.push( 
								{
									text: text,
									reps: reps,
									mass: mass,
									distance: distance,
									time: time
								}
							);
							
							record.set( 'series', series );
							this.store.fireEvent( 'update', this.store, record, Ext.data.Record.EDIT );

							this.window.close();
						},
						scope  : this
					}, {
						text   : 'Anuluj',
						iconCls: 'icon-cross',
						handler: function() {
							this.window.close()
						},
						scope  : this						
					}
				]
		});

		this.window.show();		
	},
	removeSerie: function( record, serieIdx ) {
		var series = record.get( 'series' );

		series.splice( serieIdx, 1 );

		record.set( 'series', series );
		this.store.fireEvent( 'update', this.store, record, Ext.data.Record.EDIT );
	}
});

Seiho.gym.exercise.TrainingWizard.Exercises.SerieForm = Ext.extend( Ext.form.FormPanel, {
	autoScroll   : false,
	border       : false,
	initComponent: function() {//{{{
		Ext.apply( this, {
			bodyStyle: 'padding: 10px',
			initialConfig: {
				waitMsgTarget: true
			},
			items: [
				{ 
					xtype: 'fieldset',
					title: 'Osiągnięcia w serii',
					items: [
						{ xtype: 'numberfield', fieldLabel: 'Powtórzenia', name: 'reps', allowDecimal: false },
						{ xtype: 'numberfield', fieldLabel: 'Ciężar', name: 'mass' },
						{ xtype: 'numberfield', fieldLabel: 'Odległość', name: 'distance' },
						{ xtype: 'textfield', fieldLabel: 'Czas', name: 'time' }
					]
				}
			]
		});
		Seiho.gym.exercise.TrainingWizard.Exercises.SerieForm.superclass.initComponent.apply( this, arguments );
	},
	//}}}
	getWindow: function( c ) {//{{{
		c = c || {};
		// ..
		var config = {};
		Ext.apply( config, c, {
            width      : 400,
            height     : 230,
            layout     : 'fit',
			items      : this,
			// ..
			form       : this
		})

		return new Ext.Window( config );		
	}
	//}}}
});
