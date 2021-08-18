<template>
    <div>
        <form v-on:submit.prevent="onSubmit" method="post" id="submit-conexs" v-bind:class="{loading: isLoading}">
            <label>File:</label>
            <input type="file" v-on:change="setConexsFile($event)"/>
            <br /><br />
            <textarea id="fileContents" v-bind:value="conexsFileContents" v-bind:rows="textAreaRows" v-bind:cols="textAreaColumns" v-bind:style="{display: textAreaDisplay}" readonly>
            </textarea>
            <br /><br />
            <button name="submit" value="1" type="submit" class="button submit"><i class="fa fa-plus"></i> Submit</button>
        </form>
    </div>
</template>

<script>
    import Backbone from 'backbone'

    export default {
        name: 'ConexsSubmission',
        props: {

        },

        data: function(){
            return {
                conexsFile: null,
                conexsFileContents: '',
                textAreaRows: 0,
                textAreaColumns: 0,
                textAreaDisplay: 'none',
            }
        },

        created: function(){

        },

        methods: {
            setConexsFile: function(event, onLoadFileHandler){
                // If a user cancels selecting a file, remove existing file from scope
                if(event.target.files.length === 0){
                    this.conexsFile = null
                    this.conexsFileContents = ''
                    this.textAreaRows = 0
                    this.textAreaColumns = 0
                    this.textAreaDisplay = 'none'
                    return
                }
                
                let self = this
                this.conexsFile = event.target.files[0]

                let reader = new FileReader()
                reader.onload = function(e){
                    self.conexsFileContents = e.target.result

                    // Resize text area to display the entire file without scrollbars
                    // May need to add size limits and scroll bars later
                    var rows = e.target.result.split("\n")
                    var longestRow = 0

                    for(var i=0; i<rows.length; i++){
                        if(rows[i].length > longestRow)
                            longestRow = rows[i].length
                    }

                    self.textAreaRows = rows.length
                    self.textAreaColumns = longestRow
                    self.textAreaDisplay = 'inline'
                }
                reader.readAsText(this.conexsFile)
            },

            onSubmit: function(e){
                e.preventDefault()
                let self = this

                if(this.conexsFileContents != ''){
                    Backbone.ajax({
                        url: 'http://172.23.7.54:8085/upload',
                        data: { data: self.conexsFileContents },
                        method: 'POST',

                        success: function(response) {
                            console.log('success!' + response)
                            app.alert({className: 'message notify', message: "Successfully submitted conexs file contents!"})
                            
                        },
                        error: function(response) {
                            app.alert({ title: 'Error', message: response })
                        },
                    })
                } else {
                    app.alert({ title: 'Error', message: 'No file provided, or the selected file is empty!'})
                }
            }
        },
    }
</script>