define(['marionette',
    'papaparse',
    'views/form',
    'models/ligand',
    'templates/samples/ligandadd.html'], 
    function(Marionette, Papa, TableView, Ligand, template) {

    return FormView.extend({
        template: template,

        ui: {
            fileRadio: 'input[name="fileupload"]',
            single: '.single',
            csv: '.csv',
        },

        events: {
            'change @ui.fileRadio': 'toggleInputMode',
            'change input[type="file"]': 'validateCSV'
        },

        onRender: function() {
            this.toggleInputMode()
        },

        toggleInputMode: function() {
            let isFileUpload = this.ui.fileRadio.filter(':checked').val() === 'true'

            if (isFileUpload) {
                this.ui.single.hide()
                this.ui.csv.show()
                this.model.validation.NAME.required = false
                this.model.validation.LIBRARYNAME.required = true
                this.model.validation.LIBRARYBATCHNUMBER.required = true
                this.model.validation.PLATEBARCODE.required = true
            } else {
                this.ui.single.show()
                this.ui.csv.hide()
                this.model.validation.NAME.required = true
                this.model.validation.LIBRARYNAME.required = false
                this.model.validation.LIBRARYBATCHNUMBER.required = false
                this.model.validation.PLATEBARCODE.required = false
            }
        },

        validateCSV: function(e) {
            const file = e.target.files[0]
            if (!file) return
            let seen = new Set()

            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                transformHeader: function(h, i) {
                    if (i === 0) {
                        seen = new Set()
                    }
                    const header = h.trim().toUpperCase()
                    console.log(i, header, seen)
                    // Exact matches
                    if (header === 'NAME') {
                        seen.add('NAME')
                        return 'NAME'
                    }
                    if (header === 'SMILES') {
                        seen.add('SMILES')
                        return 'SMILES'
                    }
                    if (header === 'SOURCEWELL' || header === 'SOURCE WELL' || header === 'WELL') {
                        seen.add('SOURCEWELL')
                        return 'SOURCEWELL'
                    }
                    // Partial matches only return the target if that slot hasn't been taken.
                    if (header.includes('NAME') && !header.includes('SALT') && !seen.has('NAME')) {
                        seen.add('NAME')
                        return 'NAME'
                    }
                    if (header.startsWith('SMILE') && !seen.has('SMILES')) {
                        seen.add('SMILES')
                        return 'SMILES'
                    }
                    if (header.startsWith('WELL') && !header.includes('VOLUME') && !seen.has('SOURCEWELL')) {
                        seen.add('SOURCEWELL')
                        return 'SOURCEWELL'
                    }
                    return header
                },
                complete: (results) => {
                    let valid = true
                    if (results.data.length === 0) {
                        app.alert({ message: 'Invalid CSV: No data found' })
                        valid = false
                    } else if (results.errors.length > 0) {
                        app.alert({ message: 'Invalid CSV: '+results.errors[0].message })
                        valid = false
                    }
                    for (let i = 0; i < results.data.length; i++) {
                        let rowdata = results.data[i]
                        let rownum = i+2
                        console.log(rowdata)
                        if (!rowdata.NAME) {
                            app.alert({ message: 'Invalid CSV: row '+rownum+' has no NAME value' })
                            valid = false
                        }
                        if (!rowdata.SMILES) {
                            app.alert({ message: 'Invalid CSV: row '+rownum+' has no SMILES value' })
                            valid = false
                        }
                        if (!rowdata.SOURCEWELL) {
                            app.alert({ message: 'Invalid CSV: row '+rownum+' has no WELL value' })
                            valid = false
                        }
                        if (!valid) break
                    }
                    if (valid) {
                        this.model.set('json', results.data)
                    } else {
                        e.target.value = ''
                    }
                }
            })
        },

        createModel: function() {
            this.model = new Ligand()
        },
        
        success: function(model, response, options) {
            console.log('success from ligand add', this.model)
            let ligandid = model.get('LIGANDIDS')
            if (ligandid.length === 1) {
                app.trigger('ligands:view', ligandid[0])
            } else {
                app.message({ title: 'Ligands added successfully', message: ligandid.length+' ligands added successfully' })
                app.trigger('ligands:viewall')
            }
        },

        failure: function(model, xhr, options) {
            console.log(arguments)
            let json = null
            if (xhr.responseText) {
                try { 
                    json = $.parseJSON(xhr.responseText)
                } catch(err) {
                    console.error("Error parsing response: ", err)
                }
            }

            if (json.message) app.alert({ message: json.message })
            else app.alert({ message: 'Something went wrong registering that ligand' })
        }
    })

})
