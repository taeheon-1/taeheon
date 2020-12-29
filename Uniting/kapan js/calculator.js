function calculator(){
	// console.log(estmChangeKind); // goodsType
	msgPopup = "";
	// 초기값 설정
	var $obj = $("#estmBody .estmCell[estmNo='"+estmNow+"']");
	if(typeof(estmRslt.brand)=="undefined" && estmMode != "fastship"){
		var kind = ["issueType","buyType","regType","goodsKind","cartaxAdd","insureAdd","careAdd","regTaxIn","regBondIn","regExtrIn","insureAge","insureObj","insureCar","insureSelf","insureBiz","careType","careParts","navigation","blackbox","tintSideRear","tintFront","feeAgR","feeCmR","deliveryType","deliverySido","deliveryShip","deliveryAddCost","dealerShop","takeSido","takeSidoName"];	// 공통설정 항목 useBiz
		for(var k in kind){
			if(typeof(fincConfig[estmNow][0][kind[k]])=="undefined") fincConfig[estmNow][0][kind[k]] = defaultCfg[kind[k]];
			else fincConfig[estmNow][0][kind[k]] = "";
		}
		var localOld = "none";
		var brandOld = "none";
		var modelOld = "none";
		var lineupOld = "none";
		fincConfig[estmNow][0]['deliveryMaker'] = 0;
		fincConfig[estmNow][0]['etcAccessorie'] = "";
		fincConfig[estmNow][0]['etcAccessorieCost'] = 0;
		fincConfig[estmNow][0]['modify'] = "";
		fincConfig[estmNow][0]['modifyCost'] = 0;
		$(".wrapper").addClass("use");
		//fincConfig[estmNow][0]['fastKind'] = "";	// 선구매/즉시출고
		//fincConfig[estmNow][0]['vin'] = "";
		$obj.find("input[name='bondcut7']").val(defaultCfg['bondCut7']);
		$obj.find("input[name='bondcut5']").val(defaultCfg['bondCut5']);
		fincConfig[estmNow][0]['takeExtra'] = parseInt(defaultCfg['takeExtra']);
	}else if(estmMode != "fastship"){
		if(estmRslt.brand<200) localOld = "domestic";
		else localOld = "imported";
		brandOld = estmRslt.brand;
		modelOld = estmRslt.model;
		lineupOld = estmRslt.lineup;
	}
	if(estmMode == "fastship"){
		fincConfig[estmNow][0]['deliveryType'] = "03";
		if(typeof(fincConfig[estmNow][0]['deliveryMaker'])=="undefined") fincConfig[estmNow][0]['deliveryMaker'] = 0;
	}
	// 기본 설정
	estmRslt = {};
	estmRslt.mode = estmMode;
	
	estmRslt.trim = parseInt($obj.find(".selbar[kind='trim']").attr("code"));
	estmRslt.lineup = parseInt($obj.find(".selbar[kind='lineup']").attr("code"));
	estmRslt.model = parseInt($obj.find(".selbar[kind='model']").attr("code"));
	estmRslt.brand = parseInt($obj.find(".selbar[kind='brand']").attr("code"));
	
	Dpath = 'modelData'+estmRslt.model;
	
	// 명칭
	estmRslt.logo = dataBank[Dpath]['brand'][estmRslt.brand]['logo'];
	estmRslt.brandName = dataBank[Dpath]['brand'][estmRslt.brand]['name'];
	estmRslt.modelName = dataBank[Dpath]['model'][estmRslt.model]['name'];
	estmRslt.lineupName = dataBank[Dpath]['lineup'][estmRslt.lineup]['name'];
	if(typeof(dataBank[Dpath]['lineup'][estmRslt.lineup]['year'])!="undefined") estmRslt.lineupYear = number_filter(dataBank[Dpath]['lineup'][estmRslt.lineup]['year']);
	else estmRslt.lineupYear = "";
	estmRslt.trimName = dataBank[Dpath]['trim'][estmRslt.trim]['name']; 
	
	// 국산 수입 변경 확인
	if(estmRslt.brand<200) var local = "domestic";
	else var local = "imported";
	if(estmMode == "fastship" && localOld!=local){
		if(estmMode == "rent"){
			var kind = ["insureAge","insureObj","insureCar","insureSelf","navigation","blackbox","tintSideRear","tintFront"];	// 국산 수입 변경 항목 체크
			for(var k in kind){
				if(typeof(dataBank['goodsConfig'][local][kind[k]][fincConfig[estmNow][0][kind[k]]])=="undefined"){
					if(kind[k]=="insureSelf" && local == "imported") fincConfig[estmNow][0][kind[k]] = defaultCfg['importSelf'];
					else if(typeof(defaultCfg[kind[k]])!="undefined") fincConfig[estmNow][0][kind[k]] = defaultCfg[kind[k]];
					else fincConfig[estmNow][0][kind[k]] = "";
				}
			}
			if(localOld!="none"){	// 정비 변경.. careType
				$("#estmBody .estmCell[estmNo='"+estmNow+"'] .fincBox .fincCell").each(function (){
					var fNo = parseInt($(this).attr("fincNo"));
					if(typeof(dataBank['goodsConfig'][local]['careType'][fincConfig[estmNow][fNo]['careType']])=="undefined"){
						fincConfig[estmNow][fNo]['careType'] = defaultCfg['careType'];
					}
				});
			}
		}else if(estmMode == "lease"){
			$obj.find("input[name='payType']").prop("checked",false);
			if(local == "domestic"){
				fincConfig[estmNow][0]['payType'] = "01";
			}else{
				fincConfig[estmNow][0]['payType'] = "02";
			}
			$obj.find("input[name='payType'][value='"+fincConfig[estmNow][0]['payType']+"']").prop("checked",true);
		}
	}
	if(estmMode != "fastship" && brandOld!=estmRslt.brand){
		fincConfig[estmNow][0]["dealerShop"] = "";
	}
	if(estmMode != "fastship" && modelOld!=estmRslt.model){
		fincConfig[estmNow][0]["deliveryShip"] = "";
	}
	// fincConfig[estmNow][0]["dealerShop"] = "10002";		// 제휴사 수동 지정
	// 법인 이외 보험 선택시 제외
	if(fincConfig[estmNow][0]['buyType']!="CB") fincConfig[estmNow][0]['insureBiz'] = "";
	if(fincConfig[estmNow][0]['careType']!="Self" && fincConfig[estmNow][0]['careParts'].indexOf("Standard-tire")>=0){
		fincConfig[estmNow][0]['careParts'] = fincConfig[estmNow][0]['careParts'].substring(13);
		if(fincConfig[estmNow][0]['careParts'].substring(0,1)==",") fincConfig[estmNow][0]['careParts'] = fincConfig[estmNow][0]['careParts'].substring(1);
	}
	if(fincConfig[estmNow][0]['deliveryType']!="OD") fincConfig[estmNow][0]['deliveryAddCost'] = 0;
	// 제휴사 수수료 초기화
	//if(local != "imported")  fincConfig[estmNow][0]['feeDcR'] = 0;
	if(estmChangeKind=="goodsKind" && fincConfig[estmNow][0]['goodsKind']=="loan"){
		var agMax = parseFloat(defaultCfg['agFeeMax']);
		var cmMax = parseFloat(defaultCfg['cmMax']);
		var sumMax = parseFloat(defaultCfg['sumMax']);
		var agR = parseFloat(fincConfig[estmNow][0]['feeAgR']);
		var cmR = parseFloat(fincConfig[estmNow][0]['feeCmR']);
		var sumR = agR + cmR;
		if(sumR>sumMax || (agMax && agR>agMax) || (cmMax && cmR>cmMax)){
			alertPopup("수수료율 범위를 벗어나 수수료가 조정되었습니다. 수수료율을 확인해주세요.");
			if(cmMax && cmR>cmMax) cmR = cmMax;
			if(agMax && agR>agMax) agR = agMax;
			if(agR+cmR>sumMax) agR = sumMax - cmR;
			fincConfig[estmNow][0]['feeAgR'] = agR;
			fincConfig[estmNow][0]['feeCmR'] = cmR;
		}
	}
	
	// 이미지
	if(typeof(dataBank[Dpath]['trim'][estmRslt.trim]['image'])!="undefined") estmRslt.image = dataBank[Dpath]['trim'][estmRslt.trim]['image'];
	else if(typeof(dataBank[Dpath]['lineup'][estmRslt.lineup]['image'])!="undefined") estmRslt.image = dataBank[Dpath]['lineup'][estmRslt.lineup]['image'];
	else estmRslt.image = dataBank[Dpath]['model'][estmRslt.model]['image'];
	if(typeof(dataBank[Dpath]['trim'][estmRslt.trim]['cover'])!="undefined") estmRslt.cover = dataBank[Dpath]['trim'][estmRslt.trim]['cover'];
	else if(typeof(dataBank[Dpath]['lineup'][estmRslt.lineup]['cover'])!="undefined") estmRslt.cover = dataBank[Dpath]['lineup'][estmRslt.lineup]['cover'];
	else estmRslt.cover = dataBank[Dpath]['model'][estmRslt.model]['cover'];
	if(typeof(dataBank[Dpath]['lineup'][estmRslt.lineup]['priceF'])!="undefined") estmRslt.priceF = dataBank[Dpath]['lineup'][estmRslt.lineup]['priceF'];
	else estmRslt.priceF = "";
	if(typeof(dataBank[Dpath]['lineup'][estmRslt.lineup]['catalogF'])!="undefined") estmRslt.catalogF = dataBank[Dpath]['lineup'][estmRslt.lineup]['catalogF'];
	else estmRslt.catalogF = "";
	
	// 계산 설정
	estmCfg.tax = parseFloat(dataBank[Dpath]['trim'][estmRslt.trim]['tax']);
	estmCfg.extra = dataBank[Dpath]['trim'][estmRslt.trim]['extra'];
	estmCfg.carry = parseInt(dataBank[Dpath]['trim'][estmRslt.trim]['carry']);
	estmCfg.displace = parseInt(dataBank[Dpath]['trim'][estmRslt.trim]['displace']);
	estmCfg.person = parseInt(dataBank[Dpath]['trim'][estmRslt.trim]['person']);
	estmCfg.division = dataBank[Dpath]['trim'][estmRslt.trim]['division'];
	estmCfg.cartype = dataBank[Dpath]['trim'][estmRslt.trim]['cartype'];
	estmCfg.engine = dataBank[Dpath]['trim'][estmRslt.trim]['engine'];
	
	estmRslt.taxFreeEtc = "";
	
	estmRslt.taxRate = estmCfg.tax;
	
	calculatorPrice();
	
	if(estmMode=="lease" || estmMode=="rent"){
		calculatorFinanceLR();
	}else if(estmMode=="lease"){
		calculatorFinanceL();
	}
	
	output();
	
	estmData[estmNow] = estmRslt;
	calculatorCheck();
	
}

function calculatorPrice(){
	var $obj = $("#estmBody .estmCell[estmNo='"+estmNow+"']");
	/*
	if(estmMode=="lease"){
		if($obj.find(".estmRslt_capital").attr("capital")!="0" && (estmChangeKind=="capital" || estmChangeKind=="goodsKind" || estmChangeKind=="cartaxAdd" || estmChangeKind=="payType" || estmChangeKind=="insureAdd" || estmChangeKind=="careAdd" || estmChangeKind=="dealerShop" || estmChangeKind=="incentive" || estmChangeKind=='endType' || estmChangeKind=='month' || estmChangeKind=='monthH' || estmChangeKind=='km' || estmChangeKind=='prepay' || estmChangeKind=='deposit' || estmChangeKind=='respite' || estmChangeKind=='remain')){
			var path = "capitalData_"+estmNow;
			estmRslt.capital = parseInt(dataBank[path]['capital']);
			estmRslt.takeTax = parseInt(dataBank[path]['regTax2']) + parseInt(dataBank[path]['regTax5']);
			estmRslt.takeTax2 = parseInt(dataBank[path]['regTax2']);
			estmRslt.takeTax5 = parseInt(dataBank[path]['regTax5']);
			if(fincConfig[estmNow][0]['issueType']=="20"){
				estmRslt.discountSpecial = parseInt(dataBank[path]['discountSpecial']);
				estmRslt.discountSpecialR = parseInt(dataBank[path]['discountSpecialR']);
			}else{
				estmRslt.discountSpecial = 0;
				estmRslt.discountSpecialR = 0;
			}
			fincConfig[estmNow][0]['capitalCal'] = "Y";
		}else{
			fincConfig[estmNow][0]['capitalCal'] = "N";
			estmRslt.capital = 0;
			estmRslt.takeTax = 0;
			estmRslt.discountSpecial = 0;
		}
		// 코드 변환	금융 1, 운용 2  leasAcctDvCd => prdtDvCd 
		if(fincConfig[estmNow][0]['goodsKind']=="loan") fincConfig[estmNow][0]['prdtDvCd'] = "1";
		else fincConfig[estmNow][0]['prdtDvCd'] = "2";
	}else{
		estmRslt.discountSpecial = 0;
	}
	*/
	estmRslt.discountSpecial = 0;
	// 개소세 인하/환원시 금액, 현재 사용하지 않음, 11월 중 재사용 예정
	estmRslt.vehiclePriceAdd = 0;
	
	// 기본가격
	estmRslt.trimPrice = parseInt(dataBank[Dpath]['trim'][estmRslt.trim]['price']);
	
	// 외장색상
	estmRslt.colorExt = "";
	estmRslt.colorExtPrice = 0;
	estmRslt.colorExtName = "";
	estmRslt.colorExtRgb = "";
	if(typeof(estmConfig[estmNow]['colorExt'])!="undefined" && estmConfig[estmNow]['colorExt']){
		var val = estmConfig[estmNow]['colorExt'].split("\t");
		estmRslt.colorExt = val[0];
		estmRslt.colorExtPrice =  parseInt(val[1]);
		estmRslt.colorExtName =  val[2];
		estmRslt.colorExtRgb =  val[3];
	}
	// 내장색상
	estmRslt.colorInt = "";
	estmRslt.colorIntPrice = 0;
	estmRslt.colorIntName = "";
	estmRslt.colorIntRgb = "";
	if(typeof(estmConfig[estmNow]['colorInt'])!="undefined" && estmConfig[estmNow]['colorInt']){
		var val = estmConfig[estmNow]['colorInt'].split("\t");
		estmRslt.colorInt = val[0];
		estmRslt.colorIntPrice = parseInt(val[1]);
		estmRslt.colorIntName = val[2];
		estmRslt.colorIntRgb = val[3];
	}
	// 옵션
	estmRslt.option = "";
	estmRslt.optionSum = 0;
	estmRslt.optionExtra = 0;
	estmRslt.optionAcc = 0;	// 쌍용 DC 반영하지 않아서..
	estmRslt.optionList = "";
	estmRslt.optionName = "";
	estmRslt.optionPrice = "";
	estmRslt.optionPackage = "";
	estmRslt.optionSpec = "";
	if(typeof(estmConfig[estmNow]['option'])!="undefined" && estmConfig[estmNow]['option']){
		var dat = estmConfig[estmNow]['option'].split("\n");
		for(var n in dat){
			var val = dat[n].split("\t");
			if(estmRslt.option) estmRslt.option +=",";
			estmRslt.option +=val[0];
			if(val[3]=="-"){	// 가격에 반영시 - 표시 적용
				estmRslt.trimPrice += parseInt(val[1]);
			}else{
				if(estmStart['mode']=="common" && val[3].indexOf("+")>=0) estmRslt.optionExtra += parseInt(val[1]); // 별도 납입 옵션
				estmRslt.optionSum += parseInt(val[1]);
				if(val[3].indexOf("~")>=0){
					if(estmRslt.optionSpec) estmRslt.optionSpec +="_";
					estmRslt.optionSpec +=val[0];
				}
				if(estmRslt.optionList){
					estmRslt.optionList +="\n";
					estmRslt.optionName +="^";
					estmRslt.optionPrice +="^";
					estmRslt.optionPackage +="^";
				}
				estmRslt.optionList += val[2]+"\t"+val[1];
				estmRslt.optionName += val[2];
				estmRslt.optionPrice += val[1];
				if(typeof(dataBank[Dpath]['option'][val[0]]['package'])!="undefined") estmRslt.optionPackage += dataBank[Dpath]['option'][val[0]]['package'];
				if(val[2].substring(0,1)=="[") estmRslt.optionAcc += parseInt(val[1]);
			}
		}
	}
	
	// 가격 합계
	estmRslt.priceSum = estmRslt.trimPrice + estmRslt.colorExtPrice + estmRslt.colorIntPrice + estmRslt.optionSum;	// 선택금액(차량가격)
	estmRslt.extraSum = estmRslt.colorExtPrice + estmRslt.colorIntPrice + estmRslt.optionSum;
	// 면세가격
	if(estmMode=="lease") estmRslt.vehicleFree = estmRslt.priceSum;
	else if(estmCfg.tax<=0 || estmCfg.tax==100) estmRslt.vehicleFree = estmRslt.priceSum;
	else estmRslt.vehicleFree = number_cut(estmRslt.priceSum / (1 + estmCfg.tax * 1.3 / 100),1,'round');
	// 대리점 할인금액
	estmRslt.discountMaker = 0;
	estmRslt.discountRate = 0;
	if((estmMode=="fastship" || fincConfig[estmNow][0]['issueType']=="D") && typeof(estmConfig[estmNow]['discount'])!="undefined" && estmConfig[estmNow]['discount']){
		estmRslt.discountMaker = parseFloat(estmConfig[estmNow]['discount']);
		if(estmRslt.discountMaker<100){
			estmRslt.discountRate = estmRslt.discountMaker;
			estmRslt.discountMaker = number_cut(estmRslt.vehicleFree * estmRslt.discountMaker / 100,1000,'floor');
		}else{
			estmRslt.discountRate = 0;
		}
		estmRslt.discountSpecial = 0;
	}
	// hev 혜택
	estmRslt.vehicleHev = 0;
	if(estmMode=="lease" && (estmCfg.extra.indexOf("H")>=0 || estmCfg.extra.indexOf("P")>=0 || estmCfg.extra.indexOf("E")>=0 || estmCfg.extra.indexOf("F")>=0)){
		var taxFreeBase = estmRslt.trimPrice + estmRslt.colorExtPrice + estmRslt.colorIntPrice + estmRslt.optionSum - estmRslt.discountMaker - estmRslt.discountSpecial;
		var free = number_cut(taxFreeBase / (1 + estmCfg.tax * 1.3 / 100),1,'round');
		var taxAdd = taxFreeBase - free;
		if(estmCfg.extra.indexOf("E")>=0 && taxAdd > 3000000*1.3*1.1){
			taxAdd = 3000000*1.3*1.1;
		}else if(estmCfg.extra.indexOf("F")>=0 && taxAdd > 4000000*1.3*1.1){
			taxAdd = 4000000*1.3*1.1;
		}else if((estmCfg.extra.indexOf("H")>=0 || estmCfg.extra.indexOf("P")>=0) && taxAdd > 1000000*1.3*1.1){
			taxAdd = 1000000*1.3*1.1;
		}
		estmRslt.vehicleHev = taxAdd;
	}
	/*
	if(fincConfig[estmNow][0]['deliveryType']=="01"){
		estmRslt.deliveryMaker = 0;
	}else{
		estmRslt.deliveryMaker = parseInt(fincConfig[estmNow][0]['deliveryMaker']);
	}
	*/
	estmRslt.deliveryMaker = parseInt(fincConfig[estmNow][0]['deliveryMaker']);
	estmRslt.vehicleSale = estmRslt.vehicleFree - estmRslt.discountMaker - estmRslt.discountSpecial - estmRslt.vehicleHev + estmRslt.deliveryMaker;	// 선택금액(차량가격)
	estmRslt.vehicleSupply = number_cut(estmRslt.vehicleSale/1.1,1,'round');
	
	// 제원
	if(typeof(dataBank[Dpath]['trim'][estmRslt.trim]['spec'])!="undefined" && typeof(dataBank[Dpath]['trim'][estmRslt.trim]['spec']['1853'])!="undefined") estmRslt.spec1853 = dataBank[Dpath]['trim'][estmRslt.trim]['spec']['1853'];
	else estmRslt.spec1853 = "";	// 크기
	if(typeof(dataBank[Dpath]['trim'][estmRslt.trim]['spec'])!="undefined" && typeof(dataBank[Dpath]['trim'][estmRslt.trim]['spec']['1854'])!="undefined") estmRslt.spec1854 = dataBank[Dpath]['trim'][estmRslt.trim]['spec']['1854'];
	else estmRslt.spec1854 = "";	// 엔진
	if(estmRslt.spec1854){
		if(estmRslt.optionSpec && typeof(dataBank[Dpath]['trim'][estmRslt.trim]['specoption'])!="undefined" && typeof(dataBank[Dpath]['trim'][estmRslt.trim]['specoption']['1854'])!="undefined" && typeof(dataBank[Dpath]['trim'][estmRslt.trim]['specoption']['1854'][estmRslt.optionSpec])!="undefined"){
			estmRslt.spec1854 = dataBank[Dpath]['trim'][estmRslt.trim]['specoption']['1854'][estmRslt.optionSpec];
		}
	}
	if(typeof(dataBank[Dpath]['trim'][estmRslt.trim]['spec'])!="undefined" && typeof(dataBank[Dpath]['trim'][estmRslt.trim]['spec']['1855'])!="undefined") estmRslt.spec1855 = dataBank[Dpath]['trim'][estmRslt.trim]['spec']['1855'];
	else estmRslt.spec1855 = "";	// 연비
	if(estmRslt.spec1855){
		if(estmRslt.optionSpec && typeof(dataBank[Dpath]['trim'][estmRslt.trim]['specoption'])!="undefined" && typeof(dataBank[Dpath]['trim'][estmRslt.trim]['specoption']['1855'])!="undefined" && typeof(dataBank[Dpath]['trim'][estmRslt.trim]['specoption']['1855'][estmRslt.optionSpec])!="undefined"){
			estmRslt.spec1855 = dataBank[Dpath]['trim'][estmRslt.trim]['specoption']['1855'][estmRslt.optionSpec];
		}
		if(typeof(dataBank[Dpath]['spec'][estmRslt.spec1855])!="undefined"){
			var eff = dataBank[Dpath]['spec'][estmRslt.spec1855];
			if(eff['1872']=="전기") var unit = "㎞/㎾h";
			else if(eff['1872']=="수소") var unit = "㎞/㎏";
			else var unit = "㎞/ℓ";
			estmRslt.fuelEff = "복합 "+eff['1873']+unit+"(도심 "+eff['1874']+", 고속도로 "+eff['1875']+")";
		}else{
			estmRslt.spec1855 = "";
		}
	}
	estmConfig[estmNow]['specS'] = estmRslt.spec1853+","+estmRslt.spec1854+","+estmRslt.spec1855;
	
	// 즉시출고 동일성 확인
	estmRslt.vin = "";
	estmRslt.fastKind = "";
	if(typeof(start.fastship)!="undefined"){
		if(start.model==estmRslt.model && start.trim==estmRslt.trim && start.colorExt==estmRslt.colorExt && start.colorInt==estmRslt.colorInt && start.option==estmRslt.option){
			estmRslt.vin = start.fastship;
			estmRslt.fastKind = start.fastKind;
		}
	}
	if(estmMode=="lease"){
		if(fincConfig[estmNow][0]['takeSido']=="SU") fincConfig[estmNow][0]['bondDc'] = $obj.find("input[name='bondcut7']").val();
		else fincConfig[estmNow][0]['bondDc'] = $obj.find("input[name='bondcut5']").val();
	}
}

function calculatorFinance(kd){
	if(kd=="remain" && typeof(dataBank["remainLineup"+estmRslt.lineup]['deliveryShip'])!="undefined"){
		fincConfig[estmNow][0]['deliveryShip'] = dataBank["remainLineup"+estmRslt.lineup]['deliveryShip'];
	}
	// 국산 수입 변경 확인
	if(estmRslt.brand<200) var local = "domestic";
	else var local = "imported";
	//fincConfig[estmNow][0]['insureCompany'] = dataBank["remainLineup"+estmRslt.lineup]['insureCompany'];
	if(typeof(fincData[estmNow])=="undefined") fincData[estmNow] = {};
	$("#estmBody .estmCell[estmNo='"+estmNow+"'] .fincBox .fincCell").each(function (){
		var fNo = parseInt($(this).attr("fincNo"));
		var goods = fincConfig[estmNow][fNo]['goods'];
		if((estmChangeKind!='endType' && estmChangeKind!='month' && estmChangeKind!='monthH' && estmChangeKind!='km' && estmChangeKind!='prepay' && estmChangeKind!='deposit' && estmChangeKind!='respite' && estmChangeKind!='remain') || fNo==fincNow[estmNow]){
			fincData[estmNow][fNo] = {};
			var eVal = new Object();
			// 공통 초기설정
			eVal.goods = goods;
			
			if(typeof(fincConfig[estmNow][fNo]['endType'])=="undefined") fincConfig[estmNow][fNo]['endType'] = defaultCfg['endType'];
			if(typeof(fincConfig[estmNow][fNo]['month'])=="undefined") fincConfig[estmNow][fNo]['month'] = defaultCfg['month'+fNo];
			if(typeof(fincConfig[estmNow][fNo]['prepay'])=="undefined") fincConfig[estmNow][fNo]['prepay'] = defaultCfg['prepay'+fNo];
			if(typeof(fincConfig[estmNow][fNo]['deposit'])=="undefined") fincConfig[estmNow][fNo]['deposit'] = defaultCfg['deposit'+fNo];
			if(typeof(fincConfig[estmNow][fNo]['km'])=="undefined") fincConfig[estmNow][fNo]['km'] = defaultCfg['km'];
			if(typeof(fincConfig[estmNow][fNo]['remain'])=="undefined") fincConfig[estmNow][fNo]['remain'] = defaultCfg['remain'];
			if(typeof(fincConfig[estmNow][fNo]['depositType'])=="undefined") fincConfig[estmNow][fNo]['depositType'] = defaultCfg['depositType'];
			if(typeof(fincConfig[estmNow][fNo]['remainType'])=="undefined") fincConfig[estmNow][fNo]['remainType'] = defaultCfg['remainType'];
			
			
			eVal.endType = fincConfig[estmNow][fNo]['endType'];
			eVal.month = parseInt(fincConfig[estmNow][fNo]['month']);
			if(estmMode=="lease"){
				eVal.monthH = 0;	// 금융에서 처리 예정
				eVal.respite = 0;  //		유예원금	pstpPrnc
				eVal.respiteR = 0;//		유예원금비율	pstpPrncRto
			}
			eVal.km = fincConfig[estmNow][fNo]['km'];
			eVal.careType = fincConfig[estmNow][fNo]['careType'];
			eVal.depositType = fincConfig[estmNow][fNo]['depositType'];
			
			if(typeof(dataBank["remainLineup"+estmRslt.lineup]['monthKm'])=="undefined" || typeof(dataBank["remainLineup"+estmRslt.lineup]['monthKm'][eVal.month])=="undefined" || typeof(dataBank["remainLineup"+estmRslt.lineup]['monthKm'][eVal.month][eVal.km])=="undefined"){
				eVal.remainMax = 0;
			}else{
				eVal.remainMax = parseFloat(dataBank["remainLineup"+estmRslt.lineup]['monthKm'][eVal.month][eVal.km]);
				if(eVal.remainMax>90) eVal.remainMax = 0;
			}
			
			if(estmMode=="lease" && fincConfig[estmNow][0]['goodsKind']=="loan") var rateBase = estmRslt.capital;	// 금융리스 취득원가 기준
			else if(estmMode=="lease") var rateBase = estmRslt.vehicleSale - estmRslt.deliveryMaker;	// 탁송료 전 가격
			else if(estmMode=="rent") var rateBase = estmRslt.priceSum;
			
			if(parseFloat(fincConfig[estmNow][fNo]['prepay'])<100){
				eVal.prepayR = parseFloat(fincConfig[estmNow][fNo]['prepay']);
				eVal.prepay = number_cut(eVal.prepayR * rateBase / 100, 1000, 'floor') ;
			}else{
				var maxRate = dataBank['goodsConfig'][local]['prepayMax'];
				var maxSel = number_cut(maxRate * rateBase / 100, 10000, "floor");
				if(maxSel<parseInt(fincConfig[estmNow][fNo]['prepay'])) fincConfig[estmNow][fNo]['prepay'] = maxSel;
				eVal.prepay = parseFloat(fincConfig[estmNow][fNo]['prepay']);
				eVal.prepayR = number_cut(eVal.prepay / rateBase * 10000,1,"floor") / 100;
			}
			eVal.pmtPay = number_cut( eVal.prepay / eVal.month , 100, 'ceil');
			if(eVal.goods=="lease" && fincConfig[estmNow][0]['goodsKind']=="loan"){	// 금융리스 유예원금
				if(typeof(fincConfig[estmNow][fNo]['monthH'])!="undefined")  eVal.monthH = parseInt(fincConfig[estmNow][fNo]['monthH']);
				if(typeof(fincConfig[estmNow][fNo]['respite'])!="undefined")  eVal.respiteR = parseInt(fincConfig[estmNow][fNo]['respite']);
				eVal.capital = estmRslt.capital - eVal.prepay;
				if(eVal.respiteR>100){
					eVal.respite = eVal.respiteR;
					eVal.respiteR = number_cut(eVal.respite / rateBase * 10000,1,"floor") / 100;
				}else if(eVal.respiteR){
					eVal.respite = number_cut(eVal.respiteR * rateBase / 100, 1000, 'floor');
				}
				eVal.remainR = 0;
				eVal.remain = 0;
				eVal.depositR = 0;
				eVal.deposit = 0;
				eVal.depositS = 0;
				
				var feeBase = estmRslt.capital - eVal.prepay;
				eVal.feeAg = number_cut(feeBase * parseFloat(fincConfig[estmNow][0]['feeAgR']) / 100,10,'floor');
				eVal.feeCm = number_cut(feeBase * parseFloat(fincConfig[estmNow][0]['feeCmR']) / 100,10,'floor');
				if(estmRslt.feeAg){
					estmRslt.feeAg += " / ";
					estmRslt.feeCm += " / ";
					estmRslt.feeSum += " / ";
				}
				estmRslt.feeAg += number_format(eVal.feeAg);
				estmRslt.feeCm += number_format(eVal.feeCm);
				estmRslt.feeSum += number_format(eVal.feeAg+eVal.feeCm);
				
			}else{
				if(parseFloat(fincConfig[estmNow][fNo]['deposit'])<100){
					eVal.depositR = parseFloat(fincConfig[estmNow][fNo]['deposit']);
					eVal.deposit = number_cut(eVal.depositR * rateBase / 100, 1000, 'floor');
				}else{
					var maxRate = dataBank['goodsConfig'][local]['depositMax'];
					var maxSel = number_cut(maxRate * rateBase / 100, 10000, "floor");
					if(maxSel<parseInt(fincConfig[estmNow][fNo]['deposit'])) fincConfig[estmNow][fNo]['deposit'] = maxSel;
					eVal.deposit = parseFloat(fincConfig[estmNow][fNo]['deposit']);
					eVal.depositR = number_cut(eVal.deposit / rateBase * 10000,1,"floor") / 100;
				}
				if(eVal.depositType=="cash"){
					eVal.depositS = 0;
				}else{
					eVal.depositS = eVal.deposit;
					eVal.deposit = 0;
				}
				if(fincConfig[estmNow][fNo]['remain']=="100"){
					eVal.remainR = eVal.remainMax;
				}else if(eVal.remainMax<parseFloat(fincConfig[estmNow][fNo]['remain'])){
					fincConfig[estmNow][fNo]['remain'] = eVal.remainMax;
					eVal.remainR = eVal.remainMax;
				}else{
					eVal.remainR = parseFloat(fincConfig[estmNow][fNo]['remain']);
				}
				eVal.remain = number_cut(eVal.remainR * rateBase / 100, 1000, 'floor');
				if(fincConfig[estmNow][fNo]['remainType']=="Y"){	// 할부형
					eVal.remainR = 0;
					eVal.remain = 9900;
				}
				eVal.remainType = fincConfig[estmNow][fNo]['remainType'];
			}
				
			if(goods=="rent"){
				eVal.name = "장기렌트";
			}else if(goods=="lease"){
				if(fincConfig[estmNow][0]['goodsKind']=="lease")  eVal.name = "운용리스";
				else if(fincConfig[estmNow][0]['goodsKind']=="loan")  eVal.name = "금융리스";
				else eVal.name = "오토리스";
			}
			fincData[estmNow][fNo] = eVal;
		}
	});
	output();
}
//옵션 선택 해제시 의존 체크
function optionApplyOff(name,apply,kind,trim){
	//console.log(apply+" "+kind);
	var lowerStr = "";
	var upperStr = "";
	var deleteStr = "";
	var compName = "";
	if(kind=="estimate") var $obj = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .optionSel li.on:not(.off)");
	else var $obj = $("#trim_"+trim+" li.on");
	$obj.each(function (){
		if($(this).attr("apply")){
			comp = $(this).attr("apply").replace(/[^A-Za-z]/g,"");
			if(comp){
				//console.log("not "+$(this).attr("option")+" "+comp);
				for(ot = 0; ot < comp.length; ot ++){
					os = comp.substring(ot,ot+1);
					if(os.toUpperCase()==os && upperStr.indexOf(os)<0){
						upperStr += os;
					}else if(os.toLowerCase()==os && lowerStr.indexOf(os)<0){
						lowerStr += os;
					}
				}
			}
		}
	});
	if(lowerStr){
		for(ot = 0; ot < lowerStr.length; ot ++){
			os = lowerStr.substring(ot,ot+1);
			if(upperStr.indexOf(os.toUpperCase())<0 && apply.indexOf(os.toUpperCase())>=0){
				deleteStr += os;
			}
		}
	}
	if(deleteStr){
		$obj.each(function (){
			if($(this).attr("apply")){
				comp = $(this).attr("apply").replace(/[^A-Za-z]/g,"");
				if(comp && comp.indexOf(os)>=0){
					if(compName) compName += "] 옵션과 [";
					compName += $(this).find(".name").text();
					$(this).removeClass("on");
					if(kind=="price") $(this).find("input[type='checkbox']").prop("checked",false);
				}
			}
		});
	}
	if(compName){
		alertPopup("<span class='desc'>["+name+"] 옵션은 ["+compName+"] 옵션과 함께 적용됩니다.</span> <br>["+compName+"] 옵션 선택이 함께 취소됩니다.");
	}
	
}
// 옵션 선택시 중복/의존 체크
function optionApplyOn(name,apply,kind,trim){
	var pass = true;
	var depend = false;
	var compName = "";
	if(apply.toUpperCase()!=apply) depend = true;
	if(kind=="estimate") var $obj = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .optionSel li.on:not(.off)");
	else if(kind=="price") var $obj = $("#trim_"+trim+" li.on");
	$obj.each(function (){
		if($(this).attr("apply")){
			comp = $(this).attr("apply").replace(/[^A-Za-z]/g,"");
			if(pass && comp){
				for(ot = 0; ot < apply.length; ot ++){
					os = apply.substring(ot,ot+1);
					if(os.toUpperCase()==os && comp.indexOf(os)>=0){
						pass = false;
						compName = $(this).find(".name").text();
						break;
					}else if(depend && os.toLowerCase()==os && comp.indexOf(os.toUpperCase())>=0){
						depend = false;
					}
				}
			}
		}
	});
	if(pass && depend){
		if(kind=="estimate") var $obj = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .optionSel li:not(.on,.off,.selfBox)");
		else var $obj = $("#trim_"+trim+" li:not(.on)");
		$obj.each(function (){
			if($(this).attr("apply")){
				comp = $(this).attr("apply").replace(/[^A-Za-z]/g,"");
				if(depend && comp){
					for(ot = 0; ot < apply.length; ot ++){
						os = apply.substring(ot,ot+1);
						if(os.toLowerCase()==os && comp.indexOf(os.toUpperCase())>=0){
							if(compName) compName += "] 옵션 이나 [";
							compName += $(this).find(".name").text();
						}
					}
				}
			}
		});
		if(compName=="") depend = false;
	}
	
	return [pass, depend, compName];
}

// data 변경 있는지 체크
function dataCheck(key,val){
	if(typeof(estmCheck[key])=="undefined"){
		estmCheck[key] = val;
	}else if(estmCheck[key] != val) {
		console.log(key+" X");
		//return false;
	}else{
		//console.log(key+" O");
	}
}
function calculatorCheck(){
	dataCheck("Brd-"+estmRslt.brand,estmRslt.brandName);
	dataCheck("Mod-"+estmRslt.model,estmRslt.modelName);
	dataCheck("Lup-"+estmRslt.lineup,estmRslt.lineupName);
	dataCheck("Trm-"+estmRslt.trim,estmRslt.trimPrice+"\t"+estmRslt.trimName);
	
}
function findSet(data,row, col, kind){
    var rtn = new Array();
    var tmp = data.split(row);
    if(kind=="col"){
    	var dat = tmp[0].split(col);
    	for(var d in dat){
    		if(d>0) rtn[d-1]  = $.trim(dat[d]);
    	}
    }else{
    	for (var d in tmp) {
    		if(d>0){
        		dat = tmp[d].split(col);
    			rtn[d-1]  = $.trim(dat[0]);
    		}
        }
    }
    return rtn;
}
function extractValue(data,row, col){
    var rtn = new Array();
    var tmp = data.split(row);
    for (var d in tmp) {
        if(tmp[d]){
            dat = tmp[d].split(col);
            rtn[dat[0]]  = $.trim(dat[1]);
        }
    }
    return rtn;
}
function extractCut(data){
	var rtn = new Array();
    var tmp = data.split("\n");
    for (var d in tmp) {
        if(tmp[d]){
            dat = tmp[d].split("\t");
            rtn[dat[0]] = new Array();
            rtn[dat[0]]["type"]  = $.trim(dat[1]);
            rtn[dat[0]]["step"]  = parseInt($.trim(dat[2]));
        }
    }
	if(typeof(rtn['discount'])=="undefined"){	// 할인 기본값
		rtn['discount'] = new Array();
		rtn['discount']['type'] = "floor";
		rtn['discount']['step'] = 1000;
	}
	if(typeof(rtn['payment'])=="undefined"){// 선수금
		rtn['payment'] = new Array();
		rtn['payment']['type'] = "floor";
		rtn['payment']['step'] = 1000;
	}
	if(typeof(rtn['deposit'])=="undefined"){	// 보증금
		rtn['deposit'] = new Array();
		rtn['deposit']['type'] = "floor";
		rtn['deposit']['step'] = 1000;
	}
	if(typeof(rtn['residual'])=="undefined"){	// 잔존가치
		rtn['residual'] = new Array();
		rtn['residual']['type'] = "floor";
		rtn['residual']['step'] = 1000;
	}
	if(typeof(rtn['residualFee'])=="undefined"){	// 잔가보장 수수료
		rtn['residualFee'] = new Array();
		rtn['residualFee']['type'] = "ceil";
		rtn['residualFee']['step'] = 10;
	}
	if(typeof(rtn['pmtCar'])=="undefined"){	// 납입료(차량분)
		rtn['pmtCar'] = new Array();
		rtn['pmtCar']['type'] = "ceil";
		rtn['pmtCar']['step'] = 10;
	}
	if(typeof(rtn['pmtTax'])=="undefined"){ // 납입료(차세분)
		rtn['pmtTax'] = new Array();
		rtn['pmtTax']['type'] = "ceil";
		rtn['pmtTax']['step'] = 10;
	}
	if(typeof(rtn['pmtPay'])=="undefined"){	// 납입료(선납분)
		rtn['pmtPay'] = new Array();
		rtn['pmtPay']['type'] = "ceil";
		rtn['pmtPay']['step'] = 10;
	}
	if(typeof(rtn['pmtInsure'])=="undefined"){		// 납입료(보험분)
		rtn['pmtInsure'] = new Array();
		rtn['pmtInsure']['type'] = "ceil";
		rtn['pmtInsure']['step'] = 10;
	}
	if(typeof(rtn['pmtCare'])=="undefined"){		// 납입료(일반정비)
		rtn['pmtCare'] = new Array();
		rtn['pmtCare']['type'] = "ceil";
		rtn['pmtCare']['step'] = 10;
	}
	if(typeof(rtn['pmtRepair'])=="undefined"){		// 납입료(사고정비)
		rtn['pmtRepair'] = new Array();
		rtn['pmtRepair']['type'] = "ceil";
		rtn['pmtRepair']['step'] = 10;
	}
	if(typeof(rtn['pmtAdd'])=="undefined"){		// 납입료(사고정비)
		rtn['pmtAdd'] = new Array();
		rtn['pmtAdd']['type'] = "ceil";
		rtn['pmtAdd']['step'] = 10;
	}
	if(typeof(rtn['pmtSum'])=="undefined"){		// 납입료(사고정비)
		rtn['pmtSum'] = new Array();
		rtn['pmtSum']['type'] = "floor";
		rtn['pmtSum']['step'] = 1;
	}
    return rtn;
}
function findValue(data, dat1, dat2){
	var rtn = new Array();
    var tmp = data.split("\n");
    if(tmp.length==1){
    	if($.trim(tmp[0]) == number_filter($.trim(tmp[0]))){
    		rtn['type'] = "value";
        	rtn['val'] = $.trim(tmp[0]);
    	}else{
    		rtn['type'] = $.trim(tmp[0]);
        	rtn['val'] = "";
    	}
    }else{
    	col = 0;
    	row = 0;
    	for (var d in tmp) {
            if(tmp[d] && d==0){
            	dat = tmp[d].split("\t");
                for (var r in dat) {
                	if(r==0){
                		if(dat[r]) rtn['type'] = dat[r];
                		else rtn['type'] = "value";
                	}else{
                		if(col==0 && ($.trim(dat[r]).indexOf(dat1)>=0 || $.trim(dat[r]).indexOf(dat2)>=0)) col=r;
                	}
                }
            }else if(tmp[d]){
            	dat = tmp[d].split("\t");
                for (var r in dat) {
                	if(r==0){
                		if(tmp.length==2) row = d;
                		else if(row==0 && ($.trim(dat[r]).indexOf(dat1)>=0 || $.trim(dat[r]).indexOf(dat2)>=0)) row = d;
                	}else if(row == d && col==r){
                		rtn['val'] = $.trim(dat[r]);
                	}
                }
            }
        }
    }
    return rtn;
}


