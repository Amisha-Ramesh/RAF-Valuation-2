/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/url', 'N/http'],
    /**
 * @param{record} record
 * @param{search} search
 * @param{serverWidget} serverWidget
 * @param{url} url
 */
    (serverWidget, url, http) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (context) => {
            try {

                if (context.request.method === 'GET') {
                    let form = serverWidget.createForm({
                        title: 'TV Show Search'
                    });

                    let searchField = form.addField({
                        id: 'custpage_search',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Search'
                    });

                    let searchButton = form.addSubmitButton({
                        label: 'Search Shows'
                    });

                    let resultsSublist = form.addSublist({
                        id: 'custpage_results',
                        type: serverWidget.SublistType.LIST,
                        label: 'Results'
                    });

                    resultsSublist.addField({
                        id: 'custpage_name',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Name'
                    });

                    resultsSublist.addField({
                        id: 'custpage_type',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Type'
                    });

                    resultsSublist.addField({
                        id: 'custpage_language',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Language'
                    });

                    resultsSublist.addField({
                        id: 'custpage_url',
                        type: serverWidget.FieldType.URL,
                        label: 'URL'
                    });

                    context.response.writePage(form);
                }
                else {
                    let url = 'https://api.tvmaze.com/search/shows?q=' + scriptContext.request.parameters.search;
                    let response = http.get({
                        url: url
                    });
                    let body = response.body;
                    let results = JSON.parse(body);

                    for (let i = 0; i < results.length; i++) {
                        sublist.setSublistValue({
                            id: 'name',
                            line: i,
                            value: results[i].show.name
                        });

                        sublist.setSublistValue({
                            id: 'type',
                            line: i,
                            value: results[i].show.type
                        });

                        sublist.setSublistValue({
                            id: 'language',
                            line: i,
                            value: results[i].show.language
                        });

                        sublist.setSublistValue({
                            id: 'url',
                            line: i,
                            value: results[i].show.url
                        });
                    }

                    context.response.writePage(form);
                }

            } catch (error) {

                log.error({
                    title: 'Suitelet Error',
                    details: error.message
                });

            }
        }

        return {
            onRequest: onRequest
        }


    });
