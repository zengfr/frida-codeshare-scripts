Java.perform(function() {
    var RequestMoneyRequestGatewayModel = Java.use("pt.sibs.android.mbway.core.gatewaymodels.transfer.RequestMoneyRequestGatewayModel");

    RequestMoneyRequestGatewayModel.getIdc.implementation = function() {
        console.log("Idc: teste");
        return this.getIdc();
    };
});
//https://github.com/zengfr/frida-codeshare-scripts
//742655863 @tomax143/teste