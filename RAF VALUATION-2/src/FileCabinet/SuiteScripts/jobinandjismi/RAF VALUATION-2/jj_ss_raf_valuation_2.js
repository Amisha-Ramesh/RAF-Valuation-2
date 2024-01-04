/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/email', 'N/record', 'N/log', 'N/search', 'N/runtime'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (email, record, log, search, runtime) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {

            // let today = new Date();
            // let formattedToday

            let salesRepSearch = search.create({
                type: search.Type.EMPLOYEE,
                filters: [
                    ['salesrep', 'is', 'T'] ],
                columns: ['internalid', 'entityid']
            });
            // log.debug('internalid', internalid);
            // log.debug('entityid', entityid);

            let salesRepResult = salesRepSearch.run().getRange({ start: 0, end: 20 });
            log.debug('Emplyee Result Range', salesRepResult.length);

            for (let i = 0; i < salesRepResult.length; i++) {

                let eachSalesRep = salesRepResult[i];
                let salesRepId = eachSalesRep.getValue('internalid');

                let salesRepRcd = record.load({
                    type: record.Type.EMPLOYEE,
                    id: salesRepId
                });
                let supervisorId = salesRepRcd.getValue({ fieldId: 'supervisor' });
                log.debug('supervisorId', supervisorId);

                // Get the email address of the sales manager
                let salesManager = record.load({
                    type: record.Type.EMPLOYEE,
                    id: supervisorId
                });
                let salesManagerEmail = salesManager.getValue({ fieldId: 'email' });
                log.debug('salesManagerEmail', salesManagerEmail);

                // Create a search to retrieve sales order details for the previous month by the sales rep
                let salesOrderSearch = search.create({
                    type: search.Type.SALES_ORDER,
                    filters: [
                        ['mainline', 'is', 'T'],
                        'AND',
                        ['trandate', 'on', 'today'],
                        'AND',
                        ['salesrep', 'anyof', salesRepId]
                    ],
                    columns: ['tranid', 'trandate', 'entity', 'amount']
                });
                // log.debug('tranid', tranid);
                // log.debug('trandate', trandate);
                // log.debug('entity', entity);
                // log.debug('amount', amount);

                // Execute the search
                let salesOrderResults = salesOrderSearch.run().getRange({ start: 0, end: 1000 });
                log.debug('Sales Order Range', salesOrderResults.length);
                // let emailBody;
                let emailBody = "Document Number\tCustomer name\tDate\tAmount\n";
                // for (let j = 0; j < salesOrderResults.length; j++) {
                //     salesOrder = salesOrderResults[j];
                //     emailBody = 'Document Number: ' + salesOrder.getValue('tranid') +
                //         ', Date: ' + salesOrder.getValue('trandate') +
                //         ', Customer Name: ' + salesOrder.getText('entity') +
                //         ', Amount: ' + salesOrder.getValue('amount') + '\n';
                // }
                salesOrderResults.forEach(function(salesOrder) {
                    // Build the sales order data table
                    let docNumber = salesOrder.getValue({ name: 'tranid' });
                    let customerName = salesOrder.getText({ name: 'entity' });
                    let orderDate = salesOrder.getValue({ name: 'trandate' });
                    let amount = salesOrder.getValue({ name: 'total' });
    
                    emailBody += docNumber + '\t' + customerName + '\t' + orderDate + '\t' + amount + '\n';
                });
                // Send the email
                if (salesManagerEmail) {

                    email.send({
                        author: salesManagerEmail,
                        recipients: salesRepId,
                        body: emailBody,
                        subject: 'Kindly review your sales order'
                        
                    });
                }
                else {
                    email.send({
                        author: -5,
                        recipients: salesRepId,
                        body: emailBody,
                        subject: 'Kindly review your sales order'
                       
                    });
                }

            }
        }

        return { execute }

    });