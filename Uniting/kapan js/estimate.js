estmNo = 2;	// Box 생성 번호
estmNow = 1;	// 현재 번호
estmSelf = 100;	// 현재 번호

start = new Object();
estmCode = new Object();	 // 계산 시작 임시 변수
estmData = new Object();	// 개별 데이터
estmRslt = new Object();	// 임시 저장
estmCfg = new Object();	// 트림별 계산 기준값(제원) 임시 저장
estmAdd = new Object();	// 견적 추가 코드 저장

estmCheck = new Object();	// 초기값 저장, 계산 중 변경 체크
estmConfig = new Object();	// 견적별 설정 값 보관
estmConfig[estmNow] = new Object();	// 견적별 설정 값 보관
fincConfig = new Object();	// 견적별 금융 설정 값 보관
fincConfig[estmNow] = new Object();	// 견적별 금융 설정 값 보관
fincConfig[estmNow][0] = new Object();
fincConfig[estmNow][1] = new Object();
fincConfig[estmNow][2] = new Object();
fincConfig[estmNow][3] = new Object();

estmAdd.brand = "";
estmAdd.model = "";
estmDoc = new Object();

fincNo = new Object();
fincNow = new Object();	 // 현재 번호

otherBrand = false;	// 타사 견적시 true, docuSalesInfo 에서 제외
userBrand = "";	// 회원 브랜드 선택

estmViewLeft = 0;

estmCountModel = ",";
estmCountMsg = "";
estmChangeKind = "";	// 모델 변경시 변경할 사항들..

alertPopupMsg = "";

fincData = new Object();

modeName = {CP:"일시불",FC:"할부 비교",FS:"할부 선택",RC:"렌트 비교",RS:"렌트 선택",LC:"리스 비교",LS:"리스 선택"};

careDesc = {Self:"자가정비(고객자체정비)",Semi:"부분정비 (고객 입고)",Standard:"입고정비 (고객 입고)",Special:"순회정비 (정비사 방문)"};

eventCheck = "";

// 파트너 설정 가져오기
function getPartnerConfig(idx){
	var Dpath = "partner"+idx;
	if(typeof(dataBank[Dpath]) == 'undefined' ){
		var url = "/api/partner/"+idx+"?token="+token;
		getjsonData(url,Dpath);
	}
	defaultCfg['partner'] = idx;
	console.log(dataBank[Dpath]);
}

// 브랜드 목록 - common 참조
// 모델 목록 - common 참조

//라인업 목록
function getLineupList(model){
	var Dpath = "modelData"+model;
	if(typeof(dataBank[Dpath]) == 'undefined' ){
		var url = "/api/auto/modelData_"+model+"?token="+token;
		getjsonData(url,Dpath);
	}
	var str = "";
	var tmpL = dataBank[Dpath]['model'][model]['lineup'].split(",");
	for(var n in tmpL){
		var lineup = tmpL[n];
		var lineupD = dataBank[Dpath]['lineup'][lineup];
		var sub = "";
		if(lineupD['name'].indexOf("(")>=0){
			sub += lineupD['name'].substring(lineupD['name'].indexOf("(")+1).replace(")","");
			var name = lineupD['name'].substring(0, lineupD['name'].indexOf("("));
		}else{
			var name = lineupD['name'];
		}
		if(typeof(lineupD['open'])!="undefined"){
			if(sub) sub += ", ";
			sub += lineupD['open'].substring(0,4)+"."+lineupD['open'].substring(5,7)+"~";
		}
		if(sub) name += " <span class='sub'>("+sub+")</span>";
		str += "<li lineup='"+lineup+"'><button><span class='state"+lineupD['state']+"'>"+name+"</span></button></li>";
	}
	return str;
}
//트림 목록
function getTrimList(model,lineup){
	var Dpath = "modelData"+model;
	if(typeof(dataBank[Dpath]) == 'undefined' ){
		var url = "/api/auto/modelData_"+model+"?token="+token;
		getjsonData(url,Dpath);
	}
	var str = "";
	var tmpT = dataBank[Dpath]['lineup'][lineup]['trim'].split(",");
	for(var m in tmpT){
		var trim = tmpT[m];
		var trimD = dataBank[Dpath]['trim'][trim];
		var view = true;
		if(trimD.division=="P" && trimD.name.indexOf("M/T")>0) view = false;
		if(view){
			str += "<li trim='"+trim+"'><button>";
			str+= "<span class='name state"+trimD['state']+"'>"+trimD['name']+"</span> ";	
			str+= "<span class='info'>";
			if(typeof(trimD['spec'])!="undefined" && typeof(trimD['spec'][1855])!="undefined" && typeof(dataBank[Dpath]['spec'][trimD['spec'][1855]])!="undefined"){
				str+= dataBank[Dpath]['spec'][trimD['spec'][1855]][1872]+" "+dataBank[Dpath]['spec'][trimD['spec'][1855]][1873];
				if(dataBank[Dpath]['spec'][trimD['spec'][1855]][1872]=="전기") str+= "㎞/㎾h";
				else str+= "㎞/ℓ";
			}
			str+= "</span> ";	
			str+= "<span class='price'>"+number_format(trimD['price'])+"</span>";
			str += "</button></li>";
			dataCheck("Trm-"+trim,trimD['price']+"\t"+trimD['name']);
		}
	}
	return str;
}
//색상 목록
function getColorList( model, lineup, trim, kind ){
	var Dpath = 'modelData'+model;
	var color = "";
	var ttl = "";
	var guide = "";
	if(kind=="Ext"){
		if(typeof(dataBank[Dpath]['trim'][trim]['colorExt'])!="undefined") color = dataBank[Dpath]['trim'][trim]['colorExt'];
		else if(typeof(dataBank[Dpath]['lineup'][lineup]['colorExt'])!="undefined") color = dataBank[Dpath]['lineup'][lineup]['colorExt'];
		else color = dataBank[Dpath]['model'][model]['colorExt'];
		ttl = "외장";
		if(typeof(dataBank[Dpath]['lineup'][lineup]['colorExtGuide'])!="undefined") guide = dataBank[Dpath]['lineup'][lineup]['colorExtGuide'].replace(/\n/g,"<br>").replace(/\\/g,"");
	}else if(kind=="Int"){
		if(typeof(dataBank[Dpath]['trim'][trim]['colorInt'])!="undefined") color = dataBank[Dpath]['trim'][trim]['colorInt'];
		else if(typeof(dataBank[Dpath]['lineup'][lineup]['colorInt'])!="undefined") color = dataBank[Dpath]['lineup'][lineup]['colorInt'];
		else color = dataBank[Dpath]['model'][model]['colorInt'];
		ttl = "내장";
		if(typeof(dataBank[Dpath]['lineup'][lineup]['colorIntGuide'])!="undefined") guide = dataBank[Dpath]['lineup'][lineup]['colorIntGuide'].replace(/\n/g,"<br>").replace(/\\/g,"");
	}
	var str = "";
	if(guide) str += "<li class='guide'>"+guide+"</li>";
	if(color){
		tmp = color.split("\n");
		for(var c in tmp){
			var val = tmp[c].split("\t");
			if(typeof(dataBank[Dpath]['color'+kind][val[0]])!="undefined"){
				var dat = dataBank[Dpath]['color'+kind][val[0]];
				if(dat.code) var code = "("+dat.code+")";
				else var code = "";
				if(dat.group) code += " - "+dat.group;
				var rgb =dat.rgb+"/"+dat.rgb2;
				if(typeof(val[2]) && val[2]==1) var stateCss = "state3";
				else var stateCss = "";
				var join = "";
				if(kind=="Ext"){
					if(typeof(dat['intNot'])!="undefined") join += " intNot='"+dat['intNot']+"'";
					if(typeof(dat['optionJoin'])!="undefined") join += " optionJoin='"+dat['optionJoin']+"'";
					if(typeof(dat['optionNot'])!="undefined") join += " optionNot='"+dat['optionNot']+"'";
				}else{
					if(typeof(dat['extNot'])!="undefined") join += " extNot='"+dat['extNot']+"'";
					if(typeof(dat['optionJoin'])!="undefined") join += " optionJoin='"+dat['optionJoin']+"'";
					if(typeof(dat['optionNot'])!="undefined") join += " optionNot='"+dat['optionNot']+"'";
				}
				str += "<li price='"+val[1]+"' color"+kind+"='"+val[0]+"' rgb='"+rgb+"' "+join+"><button>";
				str += "<span class='name "+stateCss+"'>"+dat.name+code+"</span>";
				str += "<span class='colorChip'><span class='colorMain' style='background-color:#"+dat.rgb+"'>&nbsp;</span>";
				if(dat.rgb2) str += "<span class='colorSub' style='background-color:#"+dat.rgb2+"'>&nbsp;</span>";
				str += "</span>";
				if(val[1]!="0") str += "<span class='price'>"+number_format(val[1])+"</span>";
				str += "</button></li>";
				dataCheck(kind+"-"+lineup+"-"+val[0],val[1]+"\t"+dat.name+code);
			}
		}
	}else{
		str += "<li class='blank'>아래 입력창에 명칭과 가격을 넣고 적용 버튼을 눌러주세요.</li>";
	}
	str += "<li class='selfBox' kind='color"+kind+"'>";
	str += "<div><span class='name'>명칭</span> <input type='text' name='name' value='' placeholder='"+ttl+" 색상 명칭'></div>";
	str += "<div><span class='name'>가격</span> <input type='text' name='price' class='numF numZ' value='' placeholder='금액'> 원 </div>";
	str += "<input type='button' value='적용'></button>";
	str += "</li>";
	return str;
}
// 색상 선택 제한
function changedColorExt(code){
	var $objE = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .colorExtSel");
	var $objI = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .colorIntSel");
	var $objO = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .optionSel");
	$objI.find("li.off").removeClass("off");
	var intNot = $objE.find("li[colorExt='"+code+"']").attr("intNot");
	var optionJoin = $objE.find("li[colorExt='"+code+"']").attr("optionJoin");
	var optionNot = $objE.find("li[colorExt='"+code+"']").attr("optionNot");
	var msg = "";
	if(intNot){
		var not = intNot.split(",");
		for(var n in not){
			if($objI.find("li[colorInt='"+not[n]+"']").hasClass("on")){		// 조건 발생하지 않음
				msg += "<span class='desc'>『"+$objI.find("li.on span.name").text()+"』 내장은 『"+$objE.find("li.on span.name").text()+"』 외장과 함께 선택되지 않습니다.</span><br>내장색상을 다시 선택해 주세요.";
				$objI.find("li[colorInt='"+not[n]+"']").removeClass("on");
				getColorIntCode();
			}
			$objI.find("li[colorInt='"+not[n]+"']").addClass("off");
		}
	}
	if(optionJoin){
		var join = optionJoin.split(",");
		var opt = "";
		for(var n in join){
			if($objO.find("li[option='"+join[n]+"']").length){
				if(opt) opt +="이나 ";
				opt += "『"+$objO.find("li[option='"+join[n]+"'] span.name").text()+"』";
			}
		}
		if(opt) msg +="<span class='desc'>『"+$objE.find("li.on span.name").text()+"』 외장은 "+opt+" 옵션과 함께 선택되어야 합니다.</span><br>옵션을 확인해 주세요.";
	}
	if(optionNot){
		var not = optionNot.split(",");
		for(var n in not){
			if($objO.find("li[option='"+not[n]+"']").hasClass("on")){		// 조건 발생하지 않음
				if(msg) msg +="<br>";
				msg += "<span class='desc'>『"+$objO.find("li.on span.name").text()+"』 옵션은 『"+$objE.find("li.on span.name").text()+"』 외장과 함께 선택되지 않습니다.</span><br>옵션을 확인해 주세요.";
				$objO.find("li[option='"+not[n]+"']").removeClass("on");
				getColorIntCode( );
			}
		}
	}
	if(msg) alertPopup(msg);
}
//색상 선택 제한
function changedColorInt(code){
	var $objE = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .colorExtSel");
	var $objI = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .colorIntSel");
	var $objO = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .optionSel");
	$objE.find("li.off").removeClass("off");
	var extNot = $objI.find("li[colorInt='"+code+"']").attr("extNot");
	var optionJoin = $objI.find("li[colorInt='"+code+"']").attr("optionJoin");
	var optionNot = $objI.find("li[colorInt='"+code+"']").attr("optionNot");
	var msg = "";
	if(extNot){
		var not = extNot.split(",");
		for(var n in not){
			if($objE.find("li[colorExt='"+not[n]+"']").hasClass("on")){	// 조건 발생하지 않음
				msg += "<span class='desc'>『"+$objE.find("li.on span.name").text()+"』 외장은 『"+$objI.find("li.on span.name").text()+"』 내장과 함께 선택되지 않습니다.</span><br>외장색상을 다시 선택해 주세요.";
				$objE.find("li[colorExt='"+not[n]+"']").removeClass("on");
				getColorExtCode( );
			}
			$objE.find("li[colorExt='"+not[n]+"']").addClass("off");
		}
	}
	if(optionJoin){
		var join = optionJoin.split(",");
		var opt = "";
		for(var n in join){
			if($objO.find("li[option='"+join[n]+"']").length){
				if(opt) opt +="이나 ";
				opt += "『"+$objO.find("li[option='"+join[n]+"'] span.name").text()+"』";
			}
		}
		if(opt) msg +="<span class='desc'>『"+$objI.find("li.on span.name").text()+"』 내장은 "+opt+" 옵션과 함께 선택되어야 합니다.</span><br>옵션을 확인해 주세요.";
	}
	if(optionNot){
		var not = optionNot.split(",");
		var opt = "";
		for(var n in not){
			if($objO.find("li[option='"+not[n]+"']").hasClass("on")){
				if(opt) opt +="이나 ";
				opt += "『"+$objO.find("li[option='"+not[n]+"'] span.name").text()+"』";
				$objO.find("li[option='"+not[n]+"']").removeClass("on")
				getOptionCode( );
			}
		}
		if(opt) msg +="<span class='desc'>『"+$objI.find("li.on span.name").text()+"』 내장은 "+opt+" 옵션은 함께 선택되지 않습니다.</span><br>옵션을 확인해 주세요.";
	}
	if(msg) alertPopup(msg);
}
// 색상 직접
function makeSelfColor(kind,code,name,price){
	var str = "<li price='"+price+"' "+kind+"='"+code+"' rgb=''>";
	str +="<button><span class='name'>"+name+"</span>";
	if(price!=0) str +="<span class='price'>"+number_format(price)+"</span></span>";
	str +="</button>";
	str +="<span class='del btnDelSelf' kind='"+kind+"'>삭제</span></li>";
	return str;
}
// 옵션 목록
function getOptionList(model, lineup, trim){
	var Dpath = 'modelData'+model;
	var option = "";
	if(typeof(dataBank[Dpath]['trim'][trim]['option'])!="undefined") option = dataBank[Dpath]['trim'][trim]['option'];
	var str = "";
	if(option){
		tmp = option.split("\n");
		for(var c in tmp){
			var val = tmp[c].split("\t");
			var dat = dataBank[Dpath]['option'][val[0]];
			if(typeof(val[3]) && val[3]==1) var stateCss = "state3";
			else var stateCss = "";
			var join = "";
			if(typeof(dat['extNot'])!="undefined") join += " extNot='"+dat['extNot']+"'";
			if(typeof(dat['extJoin'])!="undefined") join += " extJoin='"+dat['extJoin']+"'";
			if(typeof(dat['intNot'])!="undefined") join += " intNot='"+dat['intNot']+"'";
			if(typeof(dat['intJoin'])!="undefined") join += " intJoin='"+dat['intJoin']+"'";
			str += "<li apply='"+$.trim(val[2])+"' price='"+val[1]+"' option='"+val[0]+"' "+join+"><button>";
			str += "<span class='name "+stateCss+"'>"+dat.name+"</span>";
			str += "<span class='price'>"+number_format(val[1])+"</span>";
			if(typeof(dat.package)!="undefined") str += "<div class='info'>"+dat.package.replace(/\n/g,"<br>")+"</div>";
			else if(typeof(dat.items)!="undefined") str += "<div class='info'>"+dat.items.replace(/\n/g,"<br>")+"</div>";
			else if(typeof(dat.guide)!="undefined") str += "<div class='info'>"+dat.guide.replace(/\n/g,"<br>")+"</div>";
			str += "</button></li>";
			dataCheck("Opt-"+trim+"-"+val[0],val[1]+"\t"+dat.name);
		}
	}else{
		str += "<li class='blank'>아래 입력창에 명칭과 가격을 넣고 적용 버튼을 눌러주세요.</li>";
	}
	str += "<li class='selfBox' kind='option'>";
	str += "<div><span class='name'>명칭</span> <input type='text' name='name' value='' placeholder='옵션 명칭'></div>";
	str += "<div><span class='name'>가격</span> <input type='text' name='price' class='numF numZ' value='' placeholder='금액'> 원 </div>";
	str += "<input type='button' value='적용'></button>";
	str += "</li>";
	return str;
}
// 옵션 직접
function makeSelfOption(code,name,price){
	var str = "<li price='"+price+"' option='"+code+"'>";
	str +="<button><span class='name'>"+name+"</span><span class='price'>"+number_format(price)+"</span></button>";
	str +="<span class='del btnDelSelf' kind='option'>삭제</span></li>";
	return str;
}
//리스/렌트 공통 설정 표시
function getComnForm(kind,code){
	var $obj = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .comnCell");
	if(estmRslt.brand<200) var code = partnerPath+"_"+estmMode+"D";
	else var code = partnerPath+"_"+estmMode+"I";
	var str = "";
	if(kind=="incentive"){
		if(estmMode=="lease" && fincConfig[estmNow][0]['goodsKind']=="loan"){
			var agMax = defaultCfg['agFeeMax'];
			var cmMax = defaultCfg['cmMax'];
			var sumMax = defaultCfg['sumMax'];
		}else{
			var fee = dataBank[code]['set']['fee'].split("\t");
			var feeCut = fee[0].split("~");
			var feeCutDA = fee[1].split("/");
			if(typeof(feeCutDA[1])!="undefined" && feeCutDA[1]) var agMax = feeCutDA[1];
			else var agMax = "0";
			var cmMax = feeCutDA[0];
			var sumMax = feeCut[1];
		}
		str += "<div class='info'><span class='name'>한도 :</span>";
		if(agMax!="0")  str += " AG "+agMax+"% 이내, ";
		if(cmMax!="0")  str += " CM "+cmMax+"% 이내, ";
		if(sumMax!="0")  str += " AG+CM "+sumMax+"% 이내";
		str += "</div>";
		str += "<div class='check'>CM : <input class='fee numF numZ' type='text' name='feeCmR' value=''> % <span class='price estmRslt_feeCm'>0</span></div>";
		str += "<div class='check'>AG : <input class='fee numF numZ' type='text' name='feeAgR' value=''> % <span class='price estmRslt_feeAg'>0</span></div>";
		//if(local=="imported"){
		//	str += "<div class='check'>제휴사 : <input class='fee numF numZ' type='text' name='feeDcR' value=''> % <span class='price estmRslt_feeDc'>0</span></div>";
		//}
		$obj.find("."+kind+"Sel").html(str);
		$obj.find("input[name='feeCmR']").val(fincConfig[estmNow][0]['feeCmR']);
		$obj.find("input[name='feeAgR']").val(fincConfig[estmNow][0]['feeAgR']);
		//$obj.find("input[name='feeDcR']").val(fincConfig[estmNow][0]['feeDcR']);
		if(estmMode=="lease" && fincConfig[estmNow][0]['goodsKind']=="loan"){
			$obj.find(".estmRslt_feeAg").text(estmRslt.feeAg);
			$obj.find(".estmRslt_feeCm").text(estmRslt.feeCm);
		}else{
			$obj.find(".estmRslt_feeAg").text(number_format(estmRslt.feeAg));
			$obj.find(".estmRslt_feeCm").text(number_format(estmRslt.feeCm));
		}
		//$obj.find(".estmRslt_feeDc").text(number_format(estmRslt.feeDc));
	}else if(kind=="insure"){
		// var insure = {insureAge:"운전자 연령",insureObj:"대물한도"};	// ,insureCar:"자기신체",insureSelf:"자차손해 자기부담금"	: 기본값 사용
		var choice = findSet(dataBank[code]['set']['insure'],"\n", "\t", "row");
		var listAge = "";
		var listObj = "";
		var oldAge = "";
		var oldObj = "";
		for(var s in choice){
			var tmp = choice[s].split("-");
			if(tmp[0]!=oldAge){
				listAge += "<li class='' insureAge='"+number_filter(tmp[0])+"'><button>"+tmp[0]+" 이상</button></li>";
				oldAge = tmp[0];
			}
			if(tmp[1]!=oldObj){
				listObj += "<li class='' insureObj='"+number_filter(tmp[1])+"'><button>"+tmp[1]+"원</button></li>";
				oldObj = tmp[1];
			}
		}
		str += "<div class='info'><span class='name'>운전자 연령</span></div>";
		str += "<ul class='insureList' etc='insureAge'>"+listAge+"</ul>\n";
		str += "<div class='info'><span class='name'>대물한도</span></div>";
		str += "<ul class='insureList' etc='insureObj'>"+listObj+"</ul>\n";
		if(fincConfig[estmNow][0]['buyType']=="CB"){
			str += "<div class='info'><span class='name'>법인(임직원)보험특약가입</span></div>";
			str += "<div class='check'><label><input type='checkbox' value='Y' name='insureBiz'><span>가입 (임직원외 운행시 보상 불가)</span></label></div>";
		}
		$obj.find("."+kind+"Sel").html(str);
		$obj.find(".insureList li[insureAge='"+fincConfig[estmNow][0]['insureAge']+"']").addClass("on");
		$obj.find(".insureList li[insureObj='"+fincConfig[estmNow][0]['insureObj']+"']").addClass("on");
		$obj.find("input[name='insureBiz'][value='"+fincConfig[estmNow][0]['insureBiz']+"']").prop("checked", true);
	}else if(kind=="careType"){
		var choice = findSet(dataBank[code]['set']['care'],"\n", "\t", "row");
		var oldCare = "";
		str += "<div class='info'><span class='name'>정비 상품</span></div>";
		str += "<ul class='careList' etc='careType'>\n";
		for(var s in choice){
			var tmp = choice[s].split("-");
			if(tmp[0]!=oldCare){
				str += "<li class='' careType='"+tmp[0]+"'><button>"+tmp[0]+"</button></li>";
				oldCare = tmp[0];
			}
		}
		str += "</ul>\n";
		if(fincConfig[estmNow][0]['careType']=="Self"){
			str += "<div class='info'><span class='name'>Standard 선택시</span></div>";
			str += "<ul class='careList' etc='careParts'>\n";
			str += "<li class='both' careParts='Standard-tire'><button>타이어 제공</button></li>";
			str += "</ul>\n";
		}
		str += "<div class='info'><span class='name'>월동장구 (복수 선택)</span></div>";
		str += "<ul class='careList' etc='careParts'>\n";
		str += "<li class='half' careParts='Snow-chain'><button>스노우 체인</button></li>";
		str += "<li class='half' careParts='Snow-tire'><button>스노우 타이어</button></li>";
		str += "</ul>\n";
		$obj.find("."+kind+"Sel").html(str);
		$obj.find(".careList li[careType='"+fincConfig[estmNow][0]['careType']+"']").addClass("on");
		if(fincConfig[estmNow][0]['careParts']){
			var prt = fincConfig[estmNow][0]['careParts'].split(",");
			for(var p in prt){
				$obj.find(".careList li[careParts='"+prt[p]+"']").addClass("on");
			}
		}
	}else if(kind=="accessory"){
		var accessory = dataBank['codes']['list']['accessory'].split(",");
		if(estmRslt.brand<200) var Dpath = partnerPath+"_"+estmMode+"D";
		else var Dpath = partnerPath+"_"+estmMode+"I";
		var aList = dataBank[Dpath]['set']['accessory'];
		for(var s in accessory){
			if(typeof(aList[accessory[s]])!="undefined"){
				var list = "";
				var len = Object.keys(aList[accessory[s]]).length;
				var choice = dataBank['codes']['list'][accessory[s]].split(",");
				str += "<div class='info'><span class='name'>"+dataBank['codes']['accessory'][accessory[s]]['name']+"</span>";
				if(accessory[s]=="tintSideRear" || accessory[s]=="tintFront") str += "<span class='select'>투과율(농도) <input type='text' name='"+accessory[s]+"Ratio' value='' class='rateL'> %</span></div>";
				str += "</div>";
				if(len==1) var css = "both";
				else if(len==2) var css = "half";
				else if(len==3) var css = "triple";
				else var css = "";
				for(var n in choice){
					if(typeof(aList[accessory[s]][choice[n]])!="undefined"){
						list += "<li class='"+css+"' "+accessory[s]+"='"+choice[n]+"'><button>"+dataBank['codes'][accessory[s]][choice[n]]['name']+"</button></li>";
					}
				}
				str += "<ul class='accessoryList' etc='"+accessory[s]+"'>"+list+"</ul>\n";
			}
		}

		str += "<div class='info'><span class='name'>추가용품</span></div>";
		str += "<div class='check'>품목 <input type='text' name='etcAccessorie' value=''></div>";
		str += "<div class='check'>금액 <input type='text' name='etcAccessorieCost' value='0' class='price priceL numF'></div>";
		str += "<div class='notice'>※ 품목, 금액 모두 입력해주세요.</div>"
		$obj.find("."+kind+"Sel").html(str);
		for(var s in accessory){
			/*if(s=="navigation"){
				if(fincConfig[estmNow][0][s]=="Y"){
					$obj.find("input[name='"+s+"'][value='"+fincConfig[estmNow][0][s]+"']").prop("checked", true);
				}
			}else{
			*/
			$obj.find(".accessoryList li["+accessory[s]+"='"+fincConfig[estmNow][0][accessory[s]]+"']").addClass("on");
			//}
		}
		if(typeof(fincConfig[estmNow][0]['tintSideRearRatio'])!="undefined" && fincConfig[estmNow][0]['tintSideRearRatio']){
			$obj.find(".accessorySel input[name='tintSideRearRatio']").val(fincConfig[estmNow][0]['tintSideRearRatio']);
		}
		if(typeof(fincConfig[estmNow][0]['tintFrontRatio'])!="undefined" && fincConfig[estmNow][0]['tintFrontRatio']){
			$obj.find(".accessorySel input[name='tintFrontRatio']").val(fincConfig[estmNow][0]['tintFrontRatio']);
		}
		if(typeof(fincConfig[estmNow][0]['etcAccessorie'])!="undefined" && fincConfig[estmNow][0]['etcAccessorie']){
			$obj.find(".accessorySel input[name='etcAccessorie']").val(fincConfig[estmNow][0]['etcAccessorie']);
		}
		if(typeof(fincConfig[estmNow][0]['etcAccessorieCost'])!="undefined" && fincConfig[estmNow][0]['etcAccessorieCost']){
			$obj.find(".accessorySel input[name='etcAccessorieCost']").val(number_format(fincConfig[estmNow][0]['etcAccessorieCost']));
		}
	}else if(kind=="modify"){
		str += "<div class='check'>품목 <input type='text' name='modify' value=''></div>";
		str += "<div class='check'>금액 <input type='text' name='modifyCost' value='0' class='price priceL numF'></div>";
		str += "<div class='notice'>※ 품목, 금액 모두 입력해주세요.</div>"
		$obj.find("."+kind+"Sel").html(str);
		if(typeof(fincConfig[estmNow][0]['modify'])!="undefined" && fincConfig[estmNow][0]['modify']){
			$obj.find(".modifySel input[name='modify']").val(fincConfig[estmNow][0]['modify']);
		}
		if(typeof(fincConfig[estmNow][0]['modifyCost'])!="undefined" && fincConfig[estmNow][0]['modifyCost']){
			$obj.find(".modifySel input[name='modifyCost']").val(number_format(fincConfig[estmNow][0]['modifyCost']));
		}
	}else if(kind=="deliveryType"){
		var choice = dataBank['goodsConfig'][local][kind];
		var list = "";
		for(var n in choice){
			//for(var x in choice[n]){
				list += "<li class='both' deliveryType='"+n+"'><button>"+choice[n]+"</button></li>";
			//}
		}
		str += "<ul class='deliveryList'>"+list+"</ul>\n";
		$obj.find("."+kind+"Sel").html(str);
		$obj.find(".deliveryList li[deliveryType='"+fincConfig[estmNow][0]['deliveryType']+"']").addClass("on");
	}else if(kind=="deliveryShip"){
		var choice = dataBank['goodsConfig'][local][kind];
		var list = "";
		for(var n in choice){
			//for(var x in choice[n]){
				list += "<li class='half' deliveryShip='"+n+"'><button>"+choice[n]+"</button></li>";
			//}
		}
		str += "<ul class='deliveryList'>"+list+"</ul>\n";
		$obj.find("."+kind+"Sel").html(str);
		$obj.find(".deliveryList li[deliveryShip='"+fincConfig[estmNow][0]['deliveryShip']+"']").addClass("on");
		/* 출고장 라인업에 정보 사용할 경우 
		if(typeof(dataBank['remainLineup'+code][kind])=="undefined"){
			str += "<div class='info'>출고장 정보 없음</div>\n";
		}else{
			var choice = dataBank['remainLineup'+code][kind];
			var list = "";
			for(var n in choice){
				list += "<li class='half' deliveryShip='"+n+"'><button>"+choice[n]+"</button></li>";
			}
			str += "<ul class='deliveryList'>"+list+"</ul>\n";
			$obj.find("."+kind+"Sel").html(str);
			$obj.find(".deliveryList li[deliveryShip='"+fincConfig[estmNow][0]['deliveryShip']+"']").addClass("on");
		}*/
	}else if(kind=="deliverySido"){
		var choice = findSet(dataBank[code]['set']['delivery1'],"\n", "\t", "col");
		var list = "";
		for(var n in choice){
			var tmp = choice[n].split("/");
			for(var t in tmp){
				list += "<li class='triple' deliverySido='"+tmp[t]+"'><button>"+tmp[t]+"</button></li>";
			}
		}
		str += "<ul class='deliveryList'>"+list+"</ul>\n";
		if(fincConfig[estmNow][0]['deliveryType']=="OD") str += "<div class='info'>추가 외주 탁송료 <input type='text' name='deliveryAddCost' value='0' class='price priceL numF'></div>\n";
		$obj.find("."+kind+"Sel").html(str);
		$obj.find(".deliveryList li[deliverySido='"+fincConfig[estmNow][0]['deliverySido']+"']").addClass("on");
		$obj.find("."+kind+"Sel input[name='deliveryAddCost']").val(number_format(fincConfig[estmNow][0]['deliveryAddCost']));
	}else if(kind=="dealerShop"){
		if(typeof(dataBank['goodsConfig'][local][kind])!="undefined" && typeof(dataBank['goodsConfig'][local][kind][estmRslt.brand])!="undefined"){
			var choice = dataBank['goodsConfig'][local][kind][estmRslt.brand];
			var list = "";
			for(var n in choice){
				//for(var x in choice[n]){
					list += "<li class='both' dealerShop='"+n+"'><button>"+choice[n]+"</button></li>";
				//}
			}
			list += "<li class='both' dealerShop='etc'><button>기타 제휴사</button></li>";
		}else{
			list = "<li class='both' dealerShop='0'><button>제휴사 없음</button></li>";
		}
		str += "<ul class='dealerList'>"+list+"</ul>\n";
		$obj.find("."+kind+"Sel").html(str);
		$obj.find(".dealerList li[dealerShop='"+fincConfig[estmNow][0]['dealerShop']+"']").addClass("on");
	}
	
}
// 리스/렌트 상품 설정 표시
function getLoanForm(kind,code){
	var $obj = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .fincCell[fincNo='"+fincNow[estmNow]+"']");
	if(estmRslt.brand<200) var code = partnerPath+"_"+estmMode+"D";
	else var code = partnerPath+"_"+estmMode+"I";
	var str = "";
	if(kind=="endType"){
		var list = "";
		var choice = dataBank['codes']['list']['endType'].split(",");
		for(var n in choice){
			if(choice[n]!="F" || estmMode=="rent"){
				list += "<li class='half' "+kind+"='"+choice[n]+"'><button>"+dataBank['codes']['endType'][choice[n]]['name']+"</button></li>";
			}
		}
		str += "<ul class='"+kind+"List'>"+list+"</ul>\n";
		$obj.find("."+kind+"Sel").html(str);
		$obj.find("."+kind+"List li["+kind+"='"+fincConfig[estmNow][fincNow[estmNow]][kind]+"']").addClass("on");
	}else if(kind=="month"){
		var choice = dataBank[code]['set']['month'].split(",");
		var list = "";
		for(var n in choice){
			//for(var x in choice[n]){
				list += "<li class='triple' "+kind+"='"+choice[n]+"'><button>"+choice[n]+"</button></li>";
			//}
		}
		str += "<ul class='"+kind+"List'>"+list+"</ul>\n";
		$obj.find("."+kind+"Sel").html(str);
		$obj.find("."+kind+"List li["+kind+"='"+fincConfig[estmNow][fincNow[estmNow]][kind]+"']").addClass("on");
	}else if(kind=="km"){
		var choice = dataBank[code]['set']["mileage"].split(",");
		var list = "";
		for(var n in choice){
			//for(var x in choice[n]){
				list += "<li class='half' "+kind+"='"+choice[n]+"'><button>"+choice[n]+"만km/년</button></li>";
			//}
		}
		str += "<ul class='"+kind+"List'>"+list+"</ul>\n";
		$obj.find("."+kind+"Sel").html(str);
		$obj.find("."+kind+"List li["+kind+"='"+fincConfig[estmNow][fincNow[estmNow]][kind]+"']").addClass("on");
	}else if(kind=="monthH"){
		var css = "triple";
		var list = "";
		var limit = parseInt($obj.find(".selsub[kind='monthHSel']").attr("code"));
		limit = number_cut(limit/6/2,1,'floor');
		list += "<li class='"+css+"' "+kind+"='0'><button>없음</button></li>";
		for(i=1;i<=limit;i++){
			m = i *6;
			list += "<li class='"+css+"' "+kind+"='"+m+"'><button>"+m+"개월</button></li>";
		}
		str += "<ul class='"+kind+"List'>"+list+"</ul>\n";
		$obj.find("."+kind+"Sel").html(str);
		$obj.find("."+kind+"List li["+kind+"='"+fincConfig[estmNow][fincNow[estmNow]][kind]+"']").addClass("on");
	}else if(kind=="prepay" || kind=="deposit" || kind=="respite"){
		if(kind=="deposit"){
			str += "<div class='info'>";
			str += "<label><input type='radio' name='depositType' value='cash'><span>보증금액 예치</span></label>";
			str += "<label><input type='radio' name='depositType' value='stock' ><span>이행보증보험증권</span></label>";
			str += "</div>";
		}
		var limit = parseInt($obj.find(".selsub[kind='"+kind+"Sel']").attr("code"));
		var maxRate = 50;
		var maxSel = number_cut(maxRate * limit / 100, 10000, "floor");
		var list = "";
		var optnR = "";
		var optnC = "";
		for(i=0;i<=maxRate;i++){
			if(i == 0){
				list += "<li "+kind+"='"+i+"'><button>없음</button></li>";
				optnR += "<option value='"+i+"'>없음</option>";
			}else{
				if(i % 5 == 0 || i == maxRate) list += "<li "+kind+"='"+i+"'><button>"+i+"%</button></li>";
				optnR += "<option value='"+i+"'>"+i+"%</option>";
			}
		}
		var rat = 0;
		var step = number_cut(maxSel / 1000000 , 1, "floor");
		for(i=0;i<=step;i++){
			rat = i * 1000000;
			if(rat == 0) optnC += "<option value='"+rat+"'>없음</option>";
			else optnC += "<option value='"+rat+"'>"+number_format(rat/10000)+"만원</option>";
		}
		if(rat<maxSel){
			optnC += "<option value='"+maxSel+"'>"+number_format(maxSel/10000)+"만원</option>";
		}
		str += "<ul class='"+kind+"List'>"+list+"</ul>\n";
		str += "<div class='select'><span class='name'>비율</span> <select name='"+kind+"R'><option value='' selected>선택</option>"+optnR+"</select> <span class='name'>금액</span> <select name='"+kind+"C'><option value='' selected>선택</option>"+optnC+"</select></div>\n";
		str += "<div class='selfBox' kind='"+kind+"' max='"+maxSel+"'><div>";
		str += "<input type='text' class='"+kind+" numF numZ' name='"+kind+"' value='' placeholder='금액 입력'> 원 </div><input type='button' value='적용'></div>";	// 직접입력
		$obj.find("."+kind+"Sel").html(str);
		var val = fincConfig[estmNow][fincNow[estmNow]][kind];
		if(val<100){
			$obj.find("."+kind+"List li["+kind+"='"+val+"']").addClass("on");
			if($obj.find("."+kind+"List li.on").length==0){
				$obj.find("select[name='"+kind+"R']").val(val);
			}
		}else{
			if($obj.find("select[name='"+kind+"C'] option[value='"+val+"']").length) $obj.find("select[name='"+kind+"C']").val(val);
			else $obj.find("input[name='"+kind+"']").val(number_format(val));
		}
		if(kind=="deposit"){
			$obj.find("input[name='depositType'][value='"+fincConfig[estmNow][fincNow[estmNow]]['depositType']+"']").prop("checked", true);
		}
	}else if(kind=="remain"){
		var max = parseInt($obj.find(".selsub[kind='"+kind+"Sel']").attr("code"));
		var min = max - 19;
		if(min<0) min = 0;
		if(min>10) min = 10;
		var list = "<li "+kind+"='max' class='both'><button>최대 ("+max+"%)</button></li>";
		var optnR = "<option value='max'>최대</option>";
		for(i=max-1;i>=min;i--){
			if(max-i<=20) list += "<li "+kind+"='"+i+"' class='fifth'><button>"+i+"%</button></li>";
			optnR += "<option value='"+i+"'>"+i+"%</option>";
		}
		str += "<ul class='"+kind+"List'>"+list+"</ul>\n";
		str += "<div class='select'><span class='name'>비율</span> <select name='"+kind+"R'><option value='' selected>선택</option>"+optnR+"</select>";
		// if(estmMode=="rent") str += " <span class='right'><label><input type='checkbox' name='remainType' value='Y' ><span>할부형(잔가 9,900)</span></label></span>";
		str += "</div>\n";
		$obj.find("."+kind+"Sel").html(str);
		var val = fincConfig[estmNow][fincNow[estmNow]][kind];
		$obj.find("."+kind+"List li["+kind+"='"+val+"']").addClass("on");
		if($obj.find("."+kind+"List li.on").length==0){
			$obj.find("select[name='"+kind+"R']").val(val);
		}
		if(fincConfig[estmNow][fincNow[estmNow]]['remainType']=="Y"){
			$obj.find("input[name='remainType']").prop("checked",true);
			$obj.find("."+kind+"List li").removeClass("on");
		}
	}
}
//견적 설정 
function getConfigForm(){
	var str = "<form id='formEstmConfig' action='/api/config/estimate' method='POST' enctype='multipart/form-data'>\n";
	str += "<div class='editBox'>";
	str += "<dl>";
	for(i=1;i<=3;i++){
		str += "<dt>견적 "+i+"</dt><dd>";
		str += "기간 <select name='month"+i+"'><option value='36'>36개월</option><option value='48'>48개월</option><option value='60'>60개월</option></select> ";
		str += "선납금 <select name='prepay"+i+"'><option value='0'>0%</option><option value='10'>10%</option><option value='20'>20%</option><option value='30'>30%</option></select> ";
		str += "보증금 <select name='deposit"+i+"'><option value='0'>0%</option><option value='10'>10%</option><option value='20'>20%</option><option value='30'>30%</option></select> ";
		str += "</dd>";
	}
	str += "<dt>약정거리</dt><dd>";
	str += "<label><input type='radio' name='km' value='20000'><span>2만km/년</span></label><label><input type='radio' name='km' value='30000'><span>3만km/년</span></label>";
	str += "</dd>";
	str += "<dt>수수료율</dt><dd class='rate'>";
		str += "CM <input type='text' name='feeCmR' value=''>%, AG <input type='text' name='feeAgR' value=''>%";
	str += "</dd>";
	str += "<dt>화면표시</dt><dd>";
	str += "<label><input type='checkbox' name='feeView' value='N'><span>수수료액 화면표시하지 않음</span></label><br>※ 수수료가 기타로 표시되며, 클릭하여 수정할 수 있습니다.";
	str += "</dd>";
	str += "</dl>";
	str += "<div class='buttonBox'><button>저장하기</button></div>";
	$("#framePopup .content").html(str);
	// 설정 초기화
	for(i=1;i<=3;i++){
		$("#formEstmConfig select[name='month"+i+"']").val(defaultCfg['month'+i]);
		$("#formEstmConfig select[name='prepay"+i+"']").val(defaultCfg['prepay'+i]);
		$("#formEstmConfig select[name='deposit"+i+"']").val(defaultCfg['deposit'+i]);
	}
	$("#formEstmConfig input[name='km'][value='"+defaultCfg['km']+"']").prop('checked',true);
	$("#formEstmConfig input[name='feeCmR']").val(defaultCfg['feeCmR']);
	$("#formEstmConfig input[name='feeAgR']").val(defaultCfg['feeAgR']);
	$("#formEstmConfig input[name='feeView'][value='"+defaultCfg['feeView']+"']").prop('checked',true);
	$("#framePopup h3").text("견적 기본설정");
    openPopupView(600,'framePopup');
}
function estmCfgReturn(){
	for(i=1;i<=3;i++){
		defaultCfg['month'+i] = $("#formEstmConfig select[name='month"+i+"']").val();
		defaultCfg['prepay'+i] = $("#formEstmConfig select[name='prepay"+i+"']").val();
		defaultCfg['deposit'+i] = $("#formEstmConfig select[name='deposit"+i+"']").val();
	}
	defaultCfg['km'] = $("#formEstmConfig input[name='km']:checked").val();
	defaultCfg['feeCmR']= $("#formEstmConfig input[name='feeCmR']").val();
	defaultCfg['feeAgR'] = $("#formEstmConfig input[name='feeAgR']").val();
	if($("#formEstmConfig input[name='feeView']").prop("checked")==true) defaultCfg['feeView'] = "N";
	else defaultCfg['feeView'] = "Y";
	$('.layerPopup').fadeOut();
}

function addFastshipInput(kind,sNo,cnt){
	if(cnt=="" || cnt==0){
		
	}else{
		var $obj = $("#fastshipData li[sNo='"+sNo+"'] .contract");
		var str = "";
		for(i=0;i<cnt;i++){
			str += "<li><input type='text' name='num' value='' placeholder='계약번호'>";
			if(kind=="02"){
				str += " <input type='text' name='vin' value='' placeholder='차대번호(계약번호)' readonly>";
			}else{
				str += " <input type='text' name='vin' value='' placeholder='차대번호'>";
			}
			str += " <input type='date' name='day' value='' placeholder='출고예정일'></li>";
		}
		str += "<li class='btn'><button class='round addBatchList'>일괄입력</button></li>";
		$obj.html(str);
	}
}


$(function () {
	
	// 목록 펼치기
	$(document).on("click", ".selbar > button, .selsub > button, .seltop > button:not(.star)", function () {
		var $obj = $(this).parent();
		var code = $(this).parent().attr("code");
		// if(code=="not") return false;
		// 아래 탁송료 임시
		var kind = $obj.attr("kind");
		if(kind=="deliveryMSel"){
			console.log($(".comnCell .transBD").css("display"));
			if($(".comnCell .transBD").css("display")=="block") $(".comnCell .transBD").css("display","none");
			else $(".comnCell .transBD").css("display","block");
			return false;
		}
		if($obj.find(".list").css("display")!="block"){
			var kind = $obj.attr("kind");
			if(kind=="brand"){
				var brand = $obj.attr("code");
				var $objB = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .brandSel");
				if($objB.html()==""){
					$objB.html(getBrandList("estm"));
					if(brand) $objB.find("li[brand='"+brand+"']").addClass("on");
				}
			}else if(kind=="model"){
				var model = $obj.attr("code");
				var brand = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .selbar[kind='brand']").attr("code");
				if(brand==""){
					alert("브랜드를 먼저 선택해 주세요.");
					return false;
				}
				var $objM = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .modelSel");
				if($objM.html()=="" || brand!=$objM.attr("brand")){
					$objM.html(getModelList(brand,"estm"));
					$objM.attr("brand",brand);
					if(model) $objM.find("li[model='"+model+"']").addClass("on");
				}
			}else if(kind=="lineup"){
				var lineup = $obj.attr("code");
				var model = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .selbar[kind='model']").attr("code");
				if(model==""){
					alert("모델을 먼저 선택해 주세요.");
					return false;
				}
				var $objL = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .lineupSel");
				if($objL.html()=="" || model!=$objL.attr("model")){
					$objL.html(getLineupList(model));
					$objL.attr("model",model);
					if(lineup) $objL.find("li[lineup='"+lineup+"']").addClass("on");
				}
			}else if(kind=="trim"){
				var trim = $obj.attr("code");
				var lineup = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .selbar[kind='lineup']").attr("code");
				var model = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .selbar[kind='model']").attr("code");
				if(lineup==""){
					alert("라인업을 먼저 선택해 주세요.");
					return false;
				}
				var $objT = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .trimSel");
				if($objT.html()=="" || lineup!=$objT.attr("lineup")){
					$objT.html(getTrimList(model, lineup));
					$objT.attr("lineup",lineup);
					if(trim) $objT.find("li[trim='"+trim+"']").addClass("on");
				}
			}else if(kind=="colorExt" || kind=="colorInt"){
				var trim = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .selbar[kind='trim']").attr("code");
				if(trim==""){
					alert("트림을 먼저 선택해 주세요.");
					return false;
				}
			}else if(kind=="takeSidoSel"){
				if(typeof(estmCode.trim)=="undefined") return false;	
			}else if(kind=="insureSel" || kind=="careTypeSel" || kind=="accessorySel" || kind=="modifySel" || kind=="incentiveSel" || kind=="deliveryTypeSel" || kind=="deliveryShipSel" || kind=="deliverySidoSel" || kind=="dealerShopSel"){
				if(typeof(estmCode.trim)=="undefined") return false;	
				kind = kind.replace("Sel","");
				if(kind=="deliveryShip"){
					var lineup = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .selbar[kind='lineup']").attr("code");
					getComnForm(kind,lineup);
				}else{
					getComnForm(kind,"");
				}
			}else if(kind=="mode"){
				var trim = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .selbar[kind='trim']").attr("code");
				var mode = $obj.attr("code");
				if(trim==""){
					alert("트림을 먼저 선택해 주세요.");
					return false;
				}else{
					var brand = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .selbar[kind='brand']").attr("code");
					var $objM = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .modeSel");
					$objM.html(getModeList(brand));
					if(mode) $objM.find("li[mode='"+mode+"']").addClass("on");
				}
			}else if(kind=="endTypeSel" || kind=="monthSel" || kind=="monthHSel" || kind=="kmSel" || kind=="prepaySel" || kind=="depositSel" || kind=="respiteSel" || kind=="remainSel" || kind=="capitalSel"  || kind=="rateSel" || kind=="backSel" || kind=="giftSel" || kind=="endSel"){
				if(typeof(estmCode.trim)=="undefined") return false;	
				fincNow[estmNow] = parseInt($(this).closest(".fincCell").attr("fincNo"));
				var goods = fincConfig[estmNow][fincNow[estmNow]]['goods'];
				kind = kind.replace("Sel","");
				//if(goods[0]=="FS") getFinceForm(kind,goods[1]);
				getLoanForm(kind,goods);
			}
			// useNot 선택 취소 옵션 삽입
			if($obj.hasClass("useNot")){
				var $objU = $obj.find(".list ul");
				if($objU.find("li.on").length && $objU.find("li.selNot").length==0){
					$objU.prepend("<li class='selNot'><button>선택 취소</button></li>");
				}
			}
			$(".selbar .list").css("display","none");
			$(".selbar").removeClass("open");
			$(".selsub .list").css("display","none");
			$(".selsub").removeClass("open");
			$(this).parent().addClass("open");
			$obj.find(".list").slideDown("fast");
			
		}else{
			$(this).parent().removeClass("open");
			$obj.find(".list").css("display","none");
			//$obj.find(".list").slideUp("fast");
		}
		// 스크롤 이동
		if($(window).width()<=760 && !$(this).parent().hasClass("fincView")){		// 2단 840/760, 1단 670/600
			var top = $(this).offset().top;
			if(deviceType=="app") top -= 60;
			$("html, body").animate({
	    		scrollTop: top
	    	}, 500);
			//console.log(top);
		}
		return false;
	});
	$(document).on("click", ".selbar .list > button, .selsub .list > button, .seltop .list > button", function () {
		$(this).parent().prev().click();
		return false;
	});
	$(document).on("click", ".selbar .list li button, .selsub .list li button, .seltop .list li button", function () {
		/*
		var $obj = $(this).closest(".list");
		$obj.parent().removeClass("open");
		$obj.css("display","none");
		return false;
		*/
	});
	// 옵션/할인 업다운 조절
	$(document).on("click", ".unitA button.updown", function () {
		var $obj = $(this).parent().next();
		if($(this).hasClass("open")){
			var height = 275;
			$(this).removeClass("open");
			$obj.removeClass("open");
			$obj.find(".cont").css("height",height+"px");
		}else{
			var height = $obj.find("ul").height()+40;
			if(height>275){
				$(this).addClass("open");
				$obj.addClass("open");
				$obj.find(".cont").animate({
					"height": height+"px"
				},100);
			}
		}
	});
	$(document).on("click", ".unitA button.slideup", function () {
		var $obj = $(this).parent().parent();
		var height = 275;
		$(this).parent().parent().parent().find("button.updown").removeClass("open");
		$obj.removeClass("open");
		$obj.find(".cont").animate({
			"height": height+"px"
		},100);
	});
	
	
	
	// 견적 브랜드 선택
	$(document).on("click", ".brandSel button", function () {
		if(!$(this).parent().hasClass("on")){
			arrangeEstmData('brand',$(this).parent().attr("brand"));
		}
		$("#estmBody .estmCell[estmNo='"+estmNow+"'] .selbar[kind='model'] > button").click();
	});
	// 견적 모델 선택
	$(document).on("click", ".modelSel button", function () {
		if(parseInt($("#cntSet").val()) && parseInt($("#cntSet").val())<=parseInt($("#cntUse").val()) && estmCountModel.indexOf($(this).parent().attr("model"))<0){
			alertPopup("이용한도가 소진되었습니다. 문의 바랍니다.");
			return false;
		}else{
			if(!$(this).parent().hasClass("on")){
				arrangeEstmData('model',$(this).parent().attr("model"));
			}
			$("#estmBody .estmCell[estmNo='"+estmNow+"'] .selbar[kind='lineup'] > button").click();
		}
	});
	// 견적 라인업 선택
	$(document).on("click", ".lineupSel button", function () {
		if(!$(this).parent().hasClass("on")){
			arrangeEstmData('lineup',$(this).parent().attr("lineup"));
		}
		$("#estmBody .estmCell[estmNo='"+estmNow+"'] .selbar[kind='trim'] > button").click();
	});
	// 견적 트림 선택
	$(document).on("click", ".trimSel button", function () {
		if(!$(this).parent().hasClass("on")){
			arrangeEstmData('trim',$(this).parent().attr("trim"));
		}
	});
	// 견적 외장 선택
	$(document).on("click", ".colorExtSel button", function () {
		if(!$(this).parent().hasClass("on")){
			var $obj = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .colorExtSel");
			var code = $(this).parent().attr("colorExt");
			$obj.find("li.on").removeClass("on");
			if($(this).parent().hasClass("selNot")) $(this).parent().remove();
			else $(this).parent().addClass("on");
			changedColorExt(code);
			getColorExtCode();
			calculator();
		}
	});
	// 견적 내장 선택
	$(document).on("click", ".colorIntSel button", function () {
		if(!$(this).parent().hasClass("on")){
			var $obj = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .colorIntSel");
			var code = $(this).parent().attr("colorInt");
			$obj.find("li.on").removeClass("on");
			if($(this).parent().hasClass("selNot")) $(this).parent().remove();
			else $(this).parent().addClass("on");
			changedColorInt(code);
			getColorIntCode( );
			calculator();
		}
	});
	// 견적 옵션 선택
	$(document).on("click", ".optionSel li button", function () {
		var option = $(this).parent().attr("option");
		var apply = $(this).parent().attr("apply");
		var extNot = $(this).parent().attr("extNot");
		var extJoin = $(this).parent().attr("extJoin");
		var intNot = $(this).parent().attr("intNot");
		var intJoin = $(this).parent().attr("intJoin");
		var name = $(this).find(".name").text();
		if(intJoin){
			alertPopup("<span class='desc'>『"+name+"』 옵션은 내장 선택과 연결되어 있습니다. </span> <br>내장색상 선택을 확인하여 주세요.");
		}
		if(extJoin){
			alertPopup("<span class='desc'>『"+name+"』 옵션은 외장 선택과 연결되어 있습니다. </span> <br>외장색상 선택을 확인하여 주세요.");
		}
		if($(this).parent().hasClass("on")){
			if(apply.indexOf("*")==0){
				alertPopup(name+" 옵션은 필수로 선택해야 하는 항목입니다.");
				return false;
			}else{
				$(this).parent().removeClass("on");
				if(apply){
					optionApplyOff(name, apply,"estimate","");
				}
			}
		}else{
			var pass = true;
			var depend = false;
			var compName = "";
			if(extNot){
				if($("#estmBody .estmCell[estmNo='"+estmNow+"'] .colorExtSel li.on").length){
					if(extNot.indexOf($("#estmBody .estmCell[estmNo='"+estmNow+"'] .colorExtSel li.on").attr("colorExt"))>=0){
						alertPopup("<span class='desc'>『"+$("#estmBody .estmCell[estmNo='"+estmNow+"'] .colorExtSel li.on span.name").text()+"』 색상과 『"+name+"』 옵션은 함께 적용되지 않습니다. </span> <br>외장을 변경하신 후 선택해 주세요.");
						return false;
					}
				}
			}
			if(intNot){
				if($("#estmBody .estmCell[estmNo='"+estmNow+"'] .colorIntSel li.on").length){
					if(intNot.indexOf($("#estmBody .estmCell[estmNo='"+estmNow+"'] .colorIntSel li.on").attr("colorInt"))>=0){
						alertPopup("<span class='desc'>『"+$("#estmBody .estmCell[estmNo='"+estmNow+"'] .colorIntSel li.on span.name").text()+"』 색상과 『"+name+"』 옵션은 함께 적용되지 않습니다. </span> <br>내장을 변경하신 후 선택해 주세요.");
						return false;
					}
				}
			}
			if(apply){
				var rtn = optionApplyOn(name, apply,"estimate","");
				pass = rtn[0];
				depend = rtn[1];
				compName = rtn[2];
			}
			if(pass && !depend){
				$(this).parent().addClass("on");
			}else if(!pass){
				alertPopup("<span class='desc'>『"+name+"』 옵션은 『"+compName+"』 옵션과 동시에 적용되지 않습니다. </span> <br>『"+compName+"』 옵션을 취소하신 후 선택해 주세요.");
			}else{
				alertPopup("<span class='desc'>『"+name+"』 옵션은 『"+compName+"』 옵션과 함께 적용됩니다. </span><br> 『"+compName+"』 옵션을 먼저 선택해 주세요.");
			}
		}
		getOptionCode();
		calculator();
	});
	// 견적 할인 선택
	$(document).on("click", ".discountSel li button", function () {
		if(typeof(estmCode.trim)=="undefined") return false;	
		var discount = $(this).parent().parent().parent().attr("discount");
		var name = $(this).parent().parent().parent().find(".name").text();
		if($(this).parent().hasClass("on") && eventCheck != "input"){
			$(this).parent().removeClass("on");
			$(this).parent().parent().parent().removeClass("on");
		}else{
			$(this).parent().parent().find("li").removeClass("on");
			$(this).parent().addClass("on");
			$(this).parent().parent().parent().addClass("on");
		}
		eventCheck = "";
		getDiscountCode();
		calculator();
	});
	$(document).on("focus", ".discountSel input[type='text']", function () {
		eventCheck = "input";
	});
	$(document).on("blur", ".discountSel input[type='text']", function () {
		eventCheck = "input";
		getDiscountCode();
		calculator();
	});
	// 출고/구입 선택 (라디오 버튼)
	$(document).on("click", ".boxA input[type='radio']", function () {
		if(typeof(estmCode.trim)=="undefined") return false;	
		var $obj = $("#estmBody .estmCell[estmNo='"+estmNow+"']");
		var ckd = $(this).val();
		var kind = $(this).attr("name");
		$obj.find("input[name='"+kind+"']:not([value='"+ckd+"'])").prop("checked",false);
		fincConfig[estmNow][0][kind] = ckd;
		estmChangeKind = kind;
		calculator();
	});
	// 등록 지역 선택
	$(document).on("click", ".takeSidoSel button", function () {
		if(typeof(estmCode.trim)=="undefined") return false;	
		var $obj = $("#estmBody .estmCell[estmNo='"+estmNow+"']");
		$obj.find(".takeSidoSel li.on").removeClass("on");
		$(this).parent().addClass("on");
		fincConfig[estmNow][0]['takeSido'] = $(this).parent().attr("takeSido");
		fincConfig[estmNow][0]['takeSidoName'] = $(this).text();
		if($(this).parent().attr("takeSido")=="SU"){
			$obj.find(".bond7yr").removeClass("off");
			$obj.find(".bond5yr").addClass("off");
		}else{
			$obj.find(".bond7yr").addClass("off");
			$obj.find(".bond5yr").removeClass("off");
		}
		calculator();
	});
	// 견적 채권 할인율 변경
	$(document).on("blur", ".bondType input[type='text']", function () {
		if(typeof(estmCode.trim)=="undefined") return false;	
		var $obj = $("#estmBody .estmCell[estmNo='"+estmNow+"']");
		if($obj.find("input[name='bondcut7']").val()=="") $obj.find("input[name='bondcut7']").val(defaultCfg['bondCut7']);
		if($obj.find("input[name='bondcut5']").val()=="") $obj.find("input[name='bondcut7']").val(defaultCfg['bondCut5']);
		calculator();
	});
	// 부대비용 값 변경
	$(document).on("blur", "input[name='takeExtra']", function () {
		if(typeof(estmCode.trim)=="undefined") return false;	
		if($(this).val()=="") $(this).val($("#takeExtra").val());
		fincConfig[estmNow][0]['takeExtra'] = number_filter($(this).val()); 
		calculator();
	});
	
	// 공통조건 설정 변경
	$(document).on("click", ".comnCell ul li button", function () {
		var kind = $(this).closest(".selsub").attr("kind").replace("Sel","");
		if(kind=="insure"){
			var etc = $(this).closest("ul").attr("etc");
			getComnConfig(kind,$(this).parent().attr(etc),etc);
		}else if(kind=="accessory"){
			var etc = $(this).closest("ul").attr("etc");
			if($(this).parent().hasClass('on')) var cod = '';
			else var cod = $(this).parent().attr(etc);
			getComnConfig(kind,cod,etc);
		}else if(kind=="careType"){
			var etc = $(this).closest("ul").attr("etc");
			if(etc=="careParts"){
				if($(this).parent().hasClass('on')) $(this).parent().removeClass('on');
				else $(this).parent().addClass('on');
				getComnConfig('careParts','','');
			}else{
				var cod = $(this).parent().attr(etc);
				getComnConfig(kind,cod,etc);
			}
		}else{
			var etc = "";
			getComnConfig(kind,$(this).parent().attr(kind),etc);
		}
		estmChangeKind = kind;
		calculator();
		if(kind=="insure" || kind=="accessory" || kind=="careType"){
			getComnForm(kind,"");
		}
	});
	// 공통조건 설정 변경
	$(document).on("click", ".comnCell input[type='checkbox']", function () {
		var name = $(this).attr("name");
		if(name=="regTaxIn" || name=="regBondIn" || name=="regExtrIn" || name=="useBiz"){
			if($(this).prop("checked")) var data = $(this).val();
			else var data = "02";
			getComnConfig(name,data,'');
			estmChangeKind = name;
		}else if(name=="useBiz"){
			if($(this).prop("checked")) var data = $(this).val();
			else var data = "N";
			getComnConfig(name,data,'');
			estmChangeKind = name;
		}else{
			var kind = $(this).closest(".selsub").attr("kind").replace("Sel","");
			if(kind=="insure" || kind=="accessory"){
				var etc = $(this).attr("name");
				if($(this).prop("checked")) var data = $(this).val();
				else var data = "N";
				getComnConfig(kind,data,etc);
			}else{
				var etc = "";
				getComnConfig(kind,$(this).parent().attr(kind),etc);
			}
			if(kind=="insure" || kind=="accessory"){
				getComnForm(kind,"");
			}
			estmChangeKind = kind;
		}
		calculator();
	});
	// 공통조건 설정 변경
	$(document).on("change", ".comnCell select", function () {
		var etc = $(this).attr("name");
		if(etc=="tintSideRearRatio" || etc=="tintFrontRatio"){
			var kind = "accessory";
			var data = $(this).val();
			getComnConfig(kind,data,etc);
		}
		estmChangeKind = kind;
		calculator();
		if(etc=="tintSideRearRatio" || etc=="tintFrontRatio"){
			getComnForm(kind,"");
		}
	});
	// 공통조건 설정 변경
	$(document).on("blur", ".comnCell input[type='text'], input[name='deliveryMaker']", function () {
		var etc = $(this).attr("name");
		if(etc=="etcAccessorie" || etc=="etcAccessorieCost" || etc=="tintFrontRatio" || etc=="tintSideRearRatio"){
			var kind = "accessory";
			if(etc=="etcAccessorieCost") var data = number_filter($(this).val());
			else if(etc=="tintFrontRatio" || etc=="tintSideRearRatio") var data = number_only($(this).val());
			else var data = $(this).val();
			getComnConfig(kind,data,etc);
			estmChangeKind = kind;
		}else if(etc=="modify" || etc=="modifyCost"){
			var kind = "modify";
			if(etc=="modifyCost") var data = number_filter($(this).val());
			else var data = $(this).val();
			getComnConfig(kind,data,etc);
			estmChangeKind = kind;
		}else if(etc=="feeCmR" || etc=="feeAgR"){
			if(estmMode=="lease" && fincConfig[estmNow][0]['goodsKind']=="loan"){
				var agMax = parseFloat(defaultCfg['agFeeMax']);
				var cmMax = parseFloat(defaultCfg['cmMax']);
				var sumMax = parseFloat(defaultCfg['sumMax']);
			}else{
				if(estmRslt.brand<200) var code = partnerPath+"_"+estmMode+"D";
				else var code = partnerPath+"_"+estmMode+"I";
				var fee = dataBank[code]['set']['fee'].split("\t");
				var feeCut = fee[0].split("~");
				var feeCutDA = fee[1].split("/");
				if(typeof(feeCutDA[1])!="undefined" && feeCutDA[1]) var agMax = parseFloat(feeCutDA[1]);
				else var agMax = 0;
				var cmMax = parseFloat(feeCutDA[0]);
				var sumMax = parseFloat(feeCut[1]);
			}
			var $obj = $("#estmBody .estmCell[estmNo='"+estmNow+"']");
			var kind = "incentive";
			var data = parseFloat(number_filter($(this).val()));
			if(etc=="feeAgR") var sum = data + parseFloat(number_filter($obj.find("input[name='feeCmR']").val()));
			else var sum = data + parseFloat(number_filter($obj.find("input[name='feeAgR']").val()));
			if(sum>sumMax){
				alertPopup("CM+AG 수수료는 "+sumMax+"% 이내로 제한되어 있습니다.");
				$(this).val(data-sum+sumMax);
			}else if(etc=="feeCmR" && cmMax!="0" &&  data>cmMax){
				alertPopup("CM 수수료는 "+cmMax+"% 이내로 제한되어 있습니다.");
				$(this).val(cmMax);
			}else if(etc=="feeAgR" && agMax!="0" &&  data>agMax){
				alertPopup("AG 수수료는 "+agMax+"% 이내로 제한되어 있습니다.");
				$(this).val(agMax);
			}
			getComnConfig(kind,$(this).val(),etc);
			estmChangeKind = kind;
		}else if(etc=="deliveryMaker"){
			var kind = "deliveryMaker";
			var data = number_filter($(this).val());
			getComnConfig(kind,data,'');
		}else if(etc=="deliveryAddCost"){
			var kind = "deliverySido";
			var data = number_filter($(this).val());
			getComnConfig(kind,data,etc);
		}
		estmChangeKind = kind;
		calculator();
		getComnForm(kind,"");
	});
	// 금융상품 설정 변경 (선택 변경)
	$(document).on("click", ".finceSub ul li button", function () {
		var kind = $(this).closest(".selsub").attr("kind").replace("Sel","");
		var goods = fincConfig[estmNow][fincNow[estmNow]]['goods'];
		var etc = "";
		if(kind=="remain" && fincConfig[estmNow][fincNow[estmNow]]['remainType']=="Y"){
			alertPopup("<span class='desc'>할부형이 선택되어 있어 잔존가치를 변경하실 수 없습니다.</span> <br> 할부형 선택을 해제하신 후 선택해 주세요.");
		}else{
			getLoanConfig(kind,$(this).parent().attr(kind),etc);
			estmChangeKind = kind;
			calculator();
		}
	});
	$(document).on("change", ".finceSub select", function () {
		var kind = $(this).attr("name");
		var goods = fincConfig[estmNow][fincNow[estmNow]]['goods'];
		if(kind=="prepayR" || kind=="prepayC") kind = "prepay";
		else if(kind=="depositR" || kind=="depositC") kind = "deposit";
		else if(kind=="respiteR" || kind=="respiteC") kind = "respite";
		else if(kind=="remainR") kind = "remain";
		//if(goods[0]=="FS") getFinceConfig(kind,$(this).val(),'');
		//else 
		getLoanConfig(kind,$(this).val(),'');
		estmChangeKind = kind;
		calculator();
	});
	$(document).on("click", "input[name='depositType']", function () {
		var kind = $(this).attr("name");
		getLoanConfig(kind,$(this).val(),'');
		estmChangeKind = "deposit";
		calculator();
	});
	$(document).on("click", "input[name='remainType']", function () {
		var kind = $(this).attr("name");
		if($(this).prop("checked")==true) var val = $(this).val();
		else var val = "N";
		getLoanConfig(kind,val,'');
		estmChangeKind = "remain";
		calculator();
	});
	
	// 직접입력
	$(document).on("click", ".selfBox input[type='button']", function () {
		var $obj = $(this).parent();
		var kind = $obj.attr('kind');
		if(kind=="prepay" || kind=="deposit" || kind=="respite"){
			var data = number_only($obj.find("input[name='"+kind+"']").val());
			var max = parseInt($obj.attr('max'));
			if(data=="" || data>max){
				alertPopup("<span class='desc'>입력하신 금액이  "+number_format(max)+"원을 벗어났습니다.</span> <br> 금액을 다시 확인하여 주시기 바랍니다.");
			}else{
				getLoanConfig(kind,data,'');
				estmChangeKind = kind;
				calculator();
			}
		}else{
			var name = $.trim($obj.find("input[name='name']").val());
			var price = number_filter($obj.find("input[name='price']").val());
			if(name){
				if(price=="") price = 0;
				if(kind=="colorExt" || kind=="colorInt"){
					$obj.before(makeSelfColor(kind,"S",name,price));
				}else{
					var type = $obj.find("select[name='type']").val();
					if(kind=="option"){
						estmSelf ++;
						if(type=="-" && price==0){
							alert("금액을 정확히 입력해 주세요.");
							$obj.find("input[name='price']").focus();
							return false;
						}
						$obj.before(makeSelfOption("S",name,price,type));
					}
				}
				$(this).parent().addClass("off");
				$obj.find("input[name='name']").val("");
				$obj.find("input[name='price']").val("");
				$obj.prev().find("button").click();
			}else{
				alert("명칭을 먼저 입력해 주세요.");
				$obj.find("input[name='name']").focus();
			}
		}
	});
	$(document).on("click", ".btnDelSelf", function () {
		var kind = $(this).attr("kind");
		$(this).parent().next().removeClass("off");
		$(this).parent().remove();
		if(kind=="colorExt") getColorExtCode();
		else if(kind=="colorInt") getColorIntCode();
		else if(kind=="option") getOptionCode();
		$(this).parent().next().removeClass("off");
		calculator();
	});
	$(document).on("keydown", ".selfBox input[type='text']", function (e) {		// 엔터키
    	if (e.keyCode == 13){
    		$(this).parent().parent().find("input[type='button']").click();
    	}
    });
	// 취득원가 계산하기
	$(document).on("click", ".comnCell button.getCapital", function () {
		if(typeof(estmCode.trim)=="undefined") return false;	
		$(this).text("계산중…");
		getApiCostCapital();
	});
	// 견적 계산하기
	$(document).on("click", ".fincCell button.getResult", function () {
		if($(this).attr("remain")=="0"){
			alertPopup("<div>잔가율이 확정되지 않아 견적을 뽑을 수 없습니다. 다른 차종을 선택하여 주세요.</div>");
		}else{
			$(this).text("계산중…");
			fincNow[estmNow] = parseInt($(this).closest(".fincCell").attr("fincNo"));
			getApiCostResult();
		}
	});
	// 견적 별표 - 금융
    $(document).on("click", ".estmCell button.btnFincStar", function () {
    	if(typeof(estmCode.trim)=="undefined") return false;	
    	var fNo = parseInt($(this).closest(".fincCell").attr("fincNo"));
    	if($(this).hasClass("on")){
    		$(this).removeClass("on");
    	}else{
			if($("#estmBody .estmCell[estmNo='"+estmNow+"'] .btnFincStar.on").length==3){
				alert("3개 까지만 선택할 수 있습니다. 다른 선택을 취소한 후 다시 선택해 주세요.");
				return false;
			}else{
				$(this).addClass("on");
			}
    	}
    	if(deviceType=="app"){
			//sendDataToRight("sets",estmNow+"\t"+doc+"\t"+tabSel+"\t"+$obj.attr("saveNo")+"\t"+$("#estmBody").attr("saveM"));
			//sendDataToRight("tab",window.btoa(encodeURIComponent(tab)));
			//sendDataToRight("docu",window.btoa(encodeURIComponent(docu)));
			sendDataToRight("html",window.btoa(encodeURIComponent(viewLoanDocu())));
			//sendDataToRight("config",window.btoa(encodeURIComponent($obj.find(".estmRslt_data").html())));
			//sendDataToRight("edit",window.btoa(encodeURIComponent($("#docuEdit").html())));
			//sendDataToRight("star",$("#estmBody").attr("starLen")+"\t"+$("#estmBody").attr("tabM"));
		}else{
			$("#estmDocu .estmRslt_estmDocu").html(viewLoanDocu());
		}
    });
	
	// 제원 보기
	$(document).on("click", ".specViewEstm", function (event) {
    	$("#framePopup h3").text("제원 보기");
		$("#framePopup .content").html(viewSpecEstm($(this).attr("model"),$(this).attr("spec")));
		openPopupView(720,'framePopup');
    });
	// 앱 가격표 보기
	$(document).on("click", ".btnOpenInfo", function () {
		window.app.changeWebView('left');
		return false;
    });
	// 견적서 열기
	$(document).on("click", ".btnOpenDocu", function () {
		if(deviceType=="app"){
			sendDataToRight("edit",window.btoa(encodeURIComponent($("#docuEdit").html())));
			/*
			var tabM = $("#estmBody").attr("tabM");
			if(estmStart['mode']=="leaserent" && tabM) outputMLR();
			else if(estmStart['mode']=="leaserent") outputLR();
			else if(estmStart['mode']=="usedcar") outputU();
			else if(tabM) outputM();
			else output();
			*/
			window.app.changeWebView('right');
			return false;
		}else{
			$("#estmBox").addClass("open");
			var scrollPosition = $("#estmDocu").offset().top+27;
	    	$("html, body").animate({
	    		scrollTop: scrollPosition
	    	}, 500);
		}
    });
	$(document).on("click", ".btnCloseDocu", function () {
		$("#estmBox").removeClass("open");
    });
	
	// 즉시출고 목록 추가
	$(document).on("click", "#addFashship", function () {
		if(typeof(estmCode.trim)=="undefined"){
			alert("모델을 먼저 선택해 주세요.");
			return false;	
		}else if(estmRslt.colorExt==""){
			alert("외장색상을 먼저 선택해 주세요.");
			return false;	
		}else if(estmRslt.colorInt==""){
			alert("내장색상을 먼저 선택해 주세요.");
			return false;	
		}
		$("#fastshipData li.blank").addClass("off");
		addListFastship();
    });
	$(document).on("click", ".btnDelFashship", function () {
		$(this).parent().parent().remove();
		if($("#fastshipData li").length==1)  $("#fastshipData li.blank").removeClass("off");
    });
	$(document).on("click", "#fastshipData input[type='radio']", function () {
		var sNo = $(this).closest("li").attr("sNo");
		var cnt = number_only($(this).parent().parent().parent().find("input[type='text']").val());
		var kind = $(this).val();
		addFastshipInput(kind,sNo,cnt);
    });
	$(document).on("blur", "#fastshipData input[name='count']", function () {
		if($(this).parent().parent().find("input[type='radio']:checked").length==0){
			alert("선구매인지 즉시출고인지 먼저 선택해 주세요.");
			return false;
		}
		var cnt = number_only($(this).val());
		if(cnt=="" || cnt==0){
			alert("수량을 정확히 입력해 주세요.");
		}else{
			var sNo = $(this).closest("li").attr("sNo");
			var kind = $(this).parent().parent().find("input[type='radio']:checked").val();
			addFastshipInput(kind,sNo,cnt);
		}
    });
	$(document).on("click", "#fastshipData button.addBatchList", function () {	
		var sNo = $(this).parent().parent().parent().attr("sNo");
		var str = "<div class='infoPopup'>";
		str += "<div>아래 입력칸에 엑셀을 복사하여 붙여 넣으세요. <br>※ 1열 계약번호 2열 차대번호 순, 한줄에 한건씩 기록</div>";
		str += "<div><textarea name='contract' id='addBatchData'></textarea></div>";
		str += "<div class='buttonBox'><button id='addBatchBtn' sNo='"+sNo+"'>입력하기</button></div>";
		str += "</div>";
		$("#framePopup h3").text("계약번호 차대번호 일괄입력");
		$("#framePopup .content").html(str);
		openPopupView(400,'framePopup');
    });
	$(document).on("click", "#addBatchBtn", function () {		// 미사용
		var val = $.trim($("#addBatchData").val());
		if(val==""){
			alert("계약번호와 차대번호를 입력해주세요.");
		}else{
			var sNo = $(this).attr("sNo");
			var dat = val.split("\n");
			var $obj = $("#fastshipData li[sNo='"+sNo+"'] ol li:not(.btn)");
			var i = 0;
			$obj.each(function (){
				if(typeof(dat[i])!="undefined" && dat[i]){
					da = dat[i].split("\t");
					$(this).find("input[name='num']").val(da[0]);
					if(typeof(da[1])!=undefined) $(this).find("input[name='vin']").val(da[1]);
					if(typeof(da[2])!=undefined) $(this).find("input[name='day']").val(da[2]);
				}
				i++;
			});
			$('.layerPopup').fadeOut();
		}
    });
	// 즉시출고 목록 추가
	$(document).on("click", "#sendFashship", function () {
		sendListFastship();
    });
	
	// ■ 견적서 발송 저장
	$(document).on("click", "button.btnEstmAct", function () {
		// 견적 계산 없는 것 확인 후 처리 예정	type 견적 edit->estm , 저장 work->save
		var job = $(this).attr("job");
		if(job=="mod") var type = "save";
		else var type = $(this).parent().attr("type");
		if(type == "estm") $obj = $("#estmDocu .estmRslt_estmDocu");
		else $obj = $("#docuViewBox");
		var pmtErr = 0;
		$obj.find("td[fno^='G']").each(function (){
    		var pmt = number_only($(this).text());
    		if(pmt=="") pmtErr ++;
    	});
		if(pmtErr){
			alertPopup("<div>계산이 완료되지 않은 견적이 있습니다. <br>계산하기 버튼을 클릭하여 월 납입금을 확인해 주세요.</div>");
			return false;
		}
		if(job=="mod"){
			var no = $(this).attr("no");
			var key = $(this).attr("key");
    	}else if(type == "save"){
			var no = $(this).parent().attr("no");
			var key = $(this).parent().attr("key");
    	}else{
    		if(typeof(estmConfig[estmNow]['saveNo'])!="undefined" && estmConfig[estmNow]['saveNo']){
    			var no = estmConfig[estmNow]['saveNo'];
    			var key = estmConfig[estmNow]['viewKey'];
    		}else{
    			var no = "";
    			var key = "";
    		}
    	}
		
		if(job=="mod" || job=="save" || job=="fax" || job=="sms" || job=="mail" || job=="finc" || !no){	// 창 오픈			job=="talk" || 
    		if(job=="fax" || job=="sms" || job=="mail"){
    			if(job=="fax") var head = "Fax 발송";
    			else if(job=="sms") var head = "문자 발송";
    			else if(job=="mail") var head = "메일 발송";
    			if(!no) head = "견적 저장하고 "+head;
    			if(job=="sms" && grantApp.indexOf("M")>=0) var bTxt = "Web 발송";
    			else var bTxt = "발송하기";
    			// sms text web  if(grantApp.indexOf("M")>=0) str +="<button class='send' way='app'  id='msgWayApp'>App 발송</button>";
    		}else if(job=="mod" || job=="save"){
    			if(no) var head = "저장 견적 ("+no+")";
    			else var head = "견적 저장";
    			if(job=="mod") var bTxt = "수정하기";
    			else var bTxt = "저장하기";
    		}else if(job=="url"){
    			var head = "Url 생성";
    			if(!no) head = "견적 저장하고 "+head;
    			var bTxt = "생성하기";
    		}else if(job=="talk"){
    			var head = "카톡 공유";
    			if(!no) head = "견적 저장하고 "+head;
    			var bTxt = "공유하기";
    		}else if(job=="pdf" || job=="jpg"){
    			if(job=="pdf") var head = "PDF 파일 다운";
    			else if(job=="jpg") var head = "JPG 파일 다운";
    			if(!no) head = "견적 저장하고 "+head;
    			var bTxt = "다운받기";
    		}else if(job=="print"){
    			var head = "인쇄";
    			if(!no) head = "견적 저장하고 "+head;
    			var bTxt = "인쇄하기";
    		}else if(job=="finc"){
    			var head = "심사 신청";
    			if(!no) head = "견적 저장하고 "+head;
    			var bTxt = "신청하기";
    		}
    	}else if(no && key){	// 추가 저장 없이 바로 실행
    		if(job=="url" || job=="pdf" || job=="jpg" || job=="print"){
				//newWindow = window.open("about:blank", "_blank");
			}
    		estmActReturn(job,no,key,type);
    		return false;
    	}else if(no){	// 추가 저장 없이 바로 실행
    		if(job=="url" || job=="pdf" || job=="jpg" || job=="print"){
				//newWindow = window.open("about:blank", "_blank");
			}
    		var head = "";
    	}else{
    		var head = "";
    	}
		
		var str = "<form id='formEstmSave' action='/api/estimate' method='POST' enctype='multipart/form-data'>\n";
		str += "<div class='editBox'>";
    	str += "<dl>";
    	if(type=="estm"){
    		if(typeof(estmConfig['name'])!="undefined" && estmConfig['name']) var name = estmConfig['name'];
    		else var name = "";
    		if(typeof(estmConfig['subject'])!="undefined" && estmConfig['subject']) var subject = estmConfig['subject'];
    		else var subject = "";
    		if(typeof(estmConfig['counsel'])!="undefined" && estmConfig['counsel']) var counsel = estmConfig['counsel'];
    		else var counsel = "";
    	}else if(job=="mod"){
    		var name = $.trim($("dd[save='customer']").text());
    		var subject = $.trim($("dd[save='subject']").text());
    		var counsel = $.trim($("dd[save='counsel']").text());
    	}
    	
    	if(job=="mod" || job=="save" || !no){	// 기본항목
    		str += "<dt>고객</dt><dd class='small'><input type='text' name='name' value='"+name+"'>님 귀중</dd>";
    		str += "<dt>견적 제목</dt><dd class='full'><input type='text' name='subject' value='"+subject+"' placeholder='견적을 구분할 수 있는 간단한 문구'></dd>";
        	str += "<dt>상담 기록</dt><dd><textarea name='counsel'>"+counsel+"</textarea></dd>";
    	}
    	var notice = "";
    	if(job=="fax" || job=="sms"){
    		if(!no) str += "</dl><div id='saveDesc' class='saveDesc'><div class='guide'>※ 아래의 발송 정보를 입력해 주세요.</div></div><dl class='editBox'>";
    		var url = "/api/infos/"+job;
    		getjsonData(url,"infos");
    		var pointNow = parseInt(dataBank["infos"]['now']);
    		if(job=="fax"){
    			if(type=="estm"){
    				var height = $("#docuViewBox input[name='height']").val();
    			}else{
    				var height = $obj.height();
    				$obj.addClass("noZoom");
    				var height = $obj.height();
    				$obj.removeClass("noZoom");
    			}
    			if(height<=1100) var page = 1;
    			else var page = 2;
    			var cost = page * 50;
        		str += "<dt>팩스번호</dt><dd><input type='text' class='phoneF' name='to' value='' placeholder='번호만 입력'></dd>";
        		str += "<dt>페이지 수</dt><dd>"+page+" page (페이지 당 50 point 차감) <input type='hidden' name='page' value='"+page+"'></dd>";
        		str += "<dt>발신번호</dt><dd>";
        		if(dataBank["infos"]['fax']) str += "<input type='hidden' name='from' value='"+dataBank["infos"]['fax']+"'>"+dataBank["infos"]['fax'];
        		else str += "<input type='hidden' name='from' value='02-6008-6404'>팩스번호 정보 없어 카판 회신용 팩스번호 <b>02-6008-6404</b> 로 표시됨";
        		str += "</dd>";
        	}else if(job=="sms"){
        		if(key) var url = "http://m.ca8.kr/"+key;
        		else var url = "http://m.ca8.kr/******";
        		var cost = 20;
        		str += "<dt>휴대폰</dt><dd><input type='text' class='phoneF' name='to' value='' placeholder='번호만 입력'></dd>";
        		str += "<dt>첨부 선택</dt><dd><label><input type='radio' name='jpg' value='0' checked><span>SMS (20 Point, 첨부 없음)</span></label><label><input type='radio' name='jpg' value='1'><span>MMS (100 Point, JPG 첨부)</span></label></dd>";
        		str += "<dt class='mms off'>문자 제목</dt><dd class='mms off'><input type='text' name='subj' value='요청하신 견적서를 보내드립니다.' placeholder=''></dd>";
        		str += "<dt>문자 본문</dt><dd class='msgBox'><textarea name='msg' id='commentMsg'  placeholder='60 Byte 이내' onkeyup='commentLength()'>카마스터 "+$("#userName").text()+"입니다. 요청하신 견적서를 보내드립니다.</textarea>";
        		str += "<div class='length'><span id='commentLen'>47</span> / <span id='commentMax'>60</span> Byte</div>※ 위 문자 뒤에 url <b style='color:#ff7a00'>"+url+"</b> 이 추가됩니다. </dd>";
        		str += "<dt>발신번호</dt><dd>";
        		if(dataBank["infos"]['phone']){
        			var tmp = dataBank["infos"]['phone'].split(',');
        			var i = 0;
        			for(var p in tmp){
        				if(i==0) var ckd = "checked";
        				else var ckd = "";
        				str += "<label><input type='radio' name='from' value='"+tmp[p]+"' "+ckd+"><span>"+tmp[p]+"</span></label>";
        				i ++;
        			}
        			//if(grantApp.indexOf("M")>=0) str +="<label><input type='radio' name='from' value='app'><span>App 발송</span></label>";
        		}else{
        			str += "<div class='guide'>";
        			//if(grantApp.indexOf("M")>=0) str +="<label><input type='radio' name='from' value='app' checked><span>App 발송</span></label> ";
        			str += "발신번호 사전 등록 필수 <input type='button' name='noFrom' onclick=\"openFormQuestion('sms')\" value='등록 신청'></div>";
        		}
        		str += "<input type='hidden' name='way' value='web'>";
        		str += "</dd>";
        		// <textarea name="message" id="commentMsg" placeholder="내용을 입력해주세요." onkeyup="commentLength(70)"></textarea>
        	}
    		notice += "<div class='saveDesc'><div class='guide' id='sendNotice'>";
    		if(pointNow<cost){
    			notice += "※ 보유하신 "+number_format(pointNow)+" Point 가 부족하여 발송할 수 없습니다.";
    		}else{
    			notice += "※ 보유하신 "+number_format(pointNow)+" Point 에서 "+cost+" Point 차감됩니다.";
    		}
    		notice += "</div></div>";
    		notice += "<input type='hidden' name='pointNow' value='"+pointNow+"'><input type='hidden' name='cost' value='"+cost+"'>";
    	}else if(job=="mail"){
    		str += "<dt>이메일</dt><dd><input type='text' name='to' value='' placeholder='email'></dd>";
    		str += "<dt>제목</dt><dd><input type='text' name='msg' value='' placeholder='메일 제목'></dd>";
    	}else if(job=="finc"){
        	str += "<dt>견적 선택</dt><dd>";
        	var i = 0;
        	$obj.find("td[fno^='G']").each(function (){
        		i ++;
        		var fNo = $(this).attr("fno").substring(1);
        		var pmt = $(this).text();
        		var mon = $obj.find("td[fno='M"+fNo+"']").text();
        		str += "<label><input type='radio' name='fno' value='"+fNo+"'><span>견적 "+i+" : "+mon+" "+pmt+"원</span></label><br>";
        	});
        	if($obj.find(".eTitle").text().indexOf("장기렌트")>=0) var goodsKind = "rent";
        	else if($obj.find(".eTitle").text().indexOf("운용리스")>=0) var goodsKind = "lease";
        	else if($obj.find(".eTitle").text().indexOf("금융리스")>=0) var goodsKind = "loan";
        	else var goodsKind = "rent";
        	str += "<input type='hidden' name='goods' value='"+goodsKind+"'>";
        	str += "</dd>";
        	str += "</dl>";
        	str += "<div class='notice'>고객님의 신용정보제공 동의를 위하여 고객님께 url 을 보내드립니다. 고객구분을 먼저 선택하시고, 아래 정보를 입력해 주세요.</div>";
        	str += "<dl>";
        	str += "<dt>고객 구분</dt><dd><label><input type='radio' name='buy' value='1'><span>개인</span></label><label><input type='radio' name='buy' value='2'><span>개인사업자</span></label><label><input type='radio' name='buy' value='3'><span>법인</span></label></dd>";
        	str += "<dt class='fincBuy off' kind='C'>회사명</dt><dd class='fincBuy off' kind='C'><input type='text' name='compNm' value=''></dd>";
        	str += "<dt class='fincBuy off' kind='C'>사업자번호</dt><dd class='fincBuy off' kind='C'><input type='text' name='compNo' value='' maxlength='10'  onkeypress='onlyNumber();' pattern='[0-9]*' inputmode='numeric' onKeyup='this.value=this.value.replace(/[^0-9]/g,\"\");'> (숫자만 입력)</dd>";
        	str += "<dt class='fincBuy off name' kind='N'>고객 이름</dt><dd class='fincBuy off' kind='N'><input type='text' name='custNm' value=''></dd>";
        	str += "<dt class='fincBuy off phone' kind='N'>고객 휴대폰</dt><dd class='fincBuy off' kind='N'>";
        	str += "<select name='phone1'><option value='010'>010</option><option value='011'>011</option><option value='016'>016</option><option value='017'>017</option><option value='018'>018</option><option value='019'>019</option></select> - ";
        	str += "<input type='text' name='phone2' value='' maxlength='4'  onkeypress='onlyNumber();' pattern='[0-9]*' inputmode='numeric' onKeyup='this.value=this.value.replace(/[^0-9]/g,\"\");'> - ";
        	str += "<input type='text' name='phone3' value='' maxlength='4'  onkeypress='onlyNumber();' pattern='[0-9]*' inputmode='numeric' onKeyup='this.value=this.value.replace(/[^0-9]/g,\"\");'>";
        	str += "</dd>";
        	str += "<dt class='fincBuy off birth' kind='N'>고객 생년월일</dt><dd class='fincBuy off' kind='N'>";
        	str += "<select name='year'><option value=''>연도</option>";
        	var sY = yyyy - 18;
        	var eY = sY-42;
        	for(y=sY;y>eY;y--){
        		str += "<option value='"+y+"'>"+y+"</option>";
        	}
        	str += "</select> - ";
        	str += "<select name='month'><option value=''>월</option>";
        	for(m=1;m<=12;m++){
        		if(m<10) m2 = "0"+m;
			    else m2 = m;
        		str += "<option value='"+m2+"'>"+m+"</option>";
        	}
        	str += "</select> - ";
        	str += "<select name='day'><option value=''>일</option>";
        	for(d=1;d<=31;d++){
        		if(d<10) d2 = "0"+d;
			    else d2 = d;
        		str += "<option value='"+d2+"'>"+d+"</option>";
        	}
        	str += "</select>";
        	str += "</dd>";
    	}
    	//alert("btnEstmAct 2 "+no+"/"+tabs+"/"+key+"/");
    	str += "</dl>";
    	str += "</div>";
    	str += notice;
    	str += "<div class='data off'>";
    	str += "<input type='text' name='job' value='"+job+"'>\n";
    	str += "<input type='text' name='no' value='"+no+"'>\n";
    	str += "<input type='text' name='key' value='"+key+"'>\n";
    	str += "<input type='text' name='type' value='"+type+"'>\n";
    	if(job=="save" || !no || !key){	// 설정
    		str += "<input type='text' name='model' value=''>";
    		str += "<textarea name='data'></textarea>";
    		str += "<textarea name='document'></textarea>";
    	}
    	if(job!="mod" && (job=="save" || !no || !key )){
    		if(deviceType!="app"){
    			$obj.addClass("noZoom");
    		}
    		str += "<input type='text' name='height' value='"+$obj.height()+"'>";
    		if(deviceType!="app"){
    			$obj.removeClass("noZoom");
    		}
    	}
    	str += "</div>";
    	if(head){
    		str += "<div class='buttonBox'><button id='submit'>"+bTxt+"</button>";
    		if(job=="sms" && grantApp.indexOf("M")>=0) str += " <button id='submitM' class=''>App 발송</button>";
    		str += "</div>\n";
    	}
    	str += "</form>";
    	str += "</div>";
    	$("#framePopup .content").html(str);
    	if(job=="sms"){
    		commentLength();
    		if($("#formEstmSave input[name='phone']").length && $("#formEstmSave input[name='phone']").val()){
    			$("#formEstmSave input[name='to']").val($("#formEstmSave input[name='phone']").val());
    		}
    	}
    	/*if(job=="save" || !no || !key){
    		if(deviceType=="app")  window.app.callWebToWeb("main","saveEstmDocuForm","");
    		else saveEstmDocuForm();
    	}
    	*/
    	if(head){
    		$("#framePopup h3").text(head);
        	openPopupView(600,'framePopup');
        	if(job=="finc" && $obj.find(".cName").is("[type]")){
        		$("#formEstmSave input[name='buy']:input[value='"+$obj.find(".cName").attr("type")+"']").click();
        	}
    	}else{
    		if(deviceType=="app"){
				setTimeout(function() {
					ajaxSubmit("formEstmSave");
	    		}, 500);
			}else{
				ajaxSubmit("formEstmSave");
			}
    	}
    });
	// 견적서 입력 폼 변경
	$(document).on("blur", "#formEstmSave input[type='text'], #formEstmSave textarea", function () {
		var job = $("#formEstmSave input[name='job']").val();
		if(job!='mod'){
			var name = $(this).attr('name');
			var val = $(this).val();
			estmConfig[name] = val;
			if(name=="name"){
				if(val) $("#estmDocu .cName").text(val);
				else $("#estmDocu .cName").text("VIP 고객");
				if(deviceType=="app"){
					sendConfigToMain("customer",val,"");
				}
			}
		}
    });
	// 견적서 입력 폼 변경
	$(document).on("click", "#formEstmSave input[name='buy']", function () {
		var kind = $(this).val();
		$("#formEstmSave .fincBuy").addClass('off');
		if(kind=="3"){
			$("#formEstmSave .fincBuy[kind='C']").removeClass('off');
			$("#formEstmSave .fincBuy.name").text("대표자 이름");
			$("#formEstmSave .fincBuy.phone").text("대표자 휴대폰");
			$("#formEstmSave .fincBuy.birth").text("대표 생년월일");
		}else if(kind=="2"){
			$("#formEstmSave .fincBuy[kind='C']").removeClass('off');
			$("#formEstmSave .fincBuy.name").text("대표자 이름");
			$("#formEstmSave .fincBuy.phone").text("대표자 휴대폰");
			$("#formEstmSave .fincBuy.birth").text("대표 생년월일");
		}else{
			$("#formEstmSave .fincBuy.name").text("고객 이름");
			$("#formEstmSave .fincBuy.phone").text("고객 휴대폰");
			$("#formEstmSave .fincBuy.birth").text("고객 생년월일");
		}
		$("#formEstmSave .fincBuy[kind='N']").removeClass('off');
		openPopupView(600,'framePopup');
    });
	// 견적 저장 버튼
	$(document).on("click", "#formEstmSave button#submit, #formEstmSave button#submitM", function () {
		popupReload = false;
		var job = $("#formEstmSave input[name='job']").val();
		var type = $("#formEstmSave input[name='type']").val();
		if(job=="sms" || job=="fax"){
			var phone = number_only($("#formEstmSave input[name='to']").val());
			if($(this).attr("id")=="submitM"){
				var from = "app";
				$("#formEstmSave input[name='way']").val("app");
			}else if(job=="sms"){
				var from = $("#formEstmSave input[name='from']:checked").val();
				$("#formEstmSave input[name='way']").val("web");
			}else{
				var from = $("#formEstmSave input[name='from']").val();
			}
		}
		
		if( ($("#formEstmSave input[name='name']").length && !$("#formEstmSave input[name='name']").val()) && ($("#formEstmSave input[name='subject']").length && !$("#formEstmSave input[name='subject']").val()) ){
			alert("고객 이름이나 견적 제목을 입력해 주세요.");
			if($("#formEstmSave input[name='name']").length && !$("#formEstmSave input[name='name']").val()) $("#formEstmSave input[name='name']").focus();
			else $("#formEstmSave input[name='subject']").focus();
			return false;
		}else if(job=="fax" && phone.length<8){
			alert("팩스번호를 정확히 입력해 주세요.");
			$("#formEstmSave input[name='to']").focus();
			return false;
		}else if(job=="sms" && (phone.length<10 || phone.substring(0,1))!=0){
			alert("휴대폰 번호를 정확히 입력해 주세요.");
			$("#formEstmSave input[name='to']").focus();
			return false;
		}else if(job=="sms" && parseInt($("#commentLen").text())>parseInt($("#commentMax").text())){
			alert("문자 메세지를 "+$("#commentMax").text()+" Byte 이내로 입력해 주세요.");
			$("#formEstmSave textarea[name='msg']").focus();
			return false;
		}else if(job=="sms" && $("#formEstmSave input[name='cost']").val()==100 && $("#formEstmSave input[name='subj']").val()==""){
			alert("문자 메세지를 제목을 입력해 주세요.");
			$("#formEstmSave input[name='subj']").focus();
			return false;
		}else if(job=="sms" && from=="app" && $("#formEstmSave input[name='jpg']:checked").val()==1){
			alert("App 발송은 SMS 만 가능합니다. MMS는 Web발신으로 처리되니 발신번호를 변경하여 주시기 바랍니다.");
			return false;
		}else if((job=="sms" || job=="fax") && parseInt($("#formEstmSave input[name='pointNow']").val())<parseInt($("#formEstmSave input[name='cost']").val()) && from!="app"){
			alert("포인트가 부족하여 발송할 수 없습니다.");
			return false;
		}else if((job=="sms" || job=="fax") && $("#formEstmSave input[name='noFrom']").length && from!="app"){
			alert("발신번호가 등록되지 않아 발송되지 않습니다.");
			return false;
		}else if(job=="mail" && (!$("#formEstmSave input[name='to']").val() || !validateEmail($("#formEstmSave input[name='to']").val()))){
			alert("email을 정확히 입력해 주세요.");
			$("#formEstmSave input[name='to']").focus();
			return false;
		}else if(job=="mail" && !$("#formEstmSave input[name='msg']").val()){
			alert("메일 제목을 입력해 주세요.");
			$("#formEstmSave input[name='msg']").focus();
			return false;
		}else if(job=="finc" && $('#formEstmSave [name="fno"]:checked').length==0 && $('#formEstmSave [name="fno"]:checked').length==0){
			alert("심사를 진행할 최종 견적을 선택해 주세요.");
			return false;
		}else if(job=="finc" && $('#formEstmSave [name="buy"]:checked').length==0 && $('#formEstmSave [name="buy"]:checked').length==0){
			alert("고객 구분을 먼저 선택해 주세요.");
			return false;
		}else if(job=="finc" && $('#formEstmSave [name="buy"]:checked').val()!="1" && (!$("#formEstmSave input[name='compNm']").val() || $("#formEstmSave input[name='compNm']").val().length<3)){
			alert("회사명을 입력해주세요.");
			$("#formEstmSave input[name='compNm']").focus();
			return false;
		}else if(job=="finc" && $('#formEstmSave [name="buy"]:checked').val()!="1" && (!$("#formEstmSave input[name='compNo']").val() || $("#formEstmSave input[name='compNo']").val().length<10)){
			alert("사업자 번호를 입력해주세요.");
			$("#formEstmSave input[name='compNo']").focus();
			return false;
		}else if(job=="finc" && (!$("#formEstmSave input[name='custNm']").val() || $("#formEstmSave input[name='custNm']").val().length<2)){
			alert($("#formEstmSave .fincBuy.name").text()+"을 입력해주세요.");
			$("#formEstmSave input[name='custNm']").focus();
			return false;
		}else if(job=="finc" && (!$("#formEstmSave input[name='phone2']").val() || $("#formEstmSave input[name='phone2']").val().length<3)){
			alert($("#formEstmSave .fincBuy.phone").text()+"를 입력해주세요.");
			$("#formEstmSave input[name='phone2']").focus();
			return false;
		}else if(job=="finc" && (!$("#formEstmSave input[name='phone3']").val() || $("#formEstmSave input[name='phone3']").val().length<4)){
			alert($("#formEstmSave .fincBuy.phone").text()+"를 입력해주세요.");
			$("#formEstmSave input[name='phone3']").focus();
			return false;
		}else if(job=="finc" && (!$("#formEstmSave select[name='year']").val() || !$("#formEstmSave select[name='month']").val() || !$("#formEstmSave select[name='day']").val())){
			alert($("#formEstmSave .fincBuy.birth").text()+"을 선택해주세요.");
			return false;
		}else{
			/*if($("#formEstmSave input[name='name']").length && $("#formEstmSave input[name='name']").val()){
				var infoC = $("#formEstmSave input[name='name']").val()+"\t"+$("#formEstmSave input[name='title']").val()+"\t"+$("#formEstmSave input[name='phone']").val();
				if($("#formEstmSave input[name='type']").val()=="save" &&  $("#customerEdit").val()!=infoC){
					$("#customerEdit").val(infoC);
					if(deviceType=="app"){
						sendConfigToMain("customer",infoC);
						window.app.callWebToWeb("main","saveEstmDocuForm","");
					}else{
						saveEstmDocuForm();
					}
				}
			}
			*/
			if(type=="estm"){
	        	if(deviceType=="app"){
	        		window.app.callWebToWeb("main","saveEstmDataForm","");
	        	}else{
	        		saveEstmDataForm();
	        	}
	        	saveEstmDocuForm();
			}
			if(job=="url" || job=="pdf" || job=="jpg" || job=="print"){
				//newWindow = window.open("about:blank", "_blank");
			}
			if(job=="finc"){
				$('.layerPopup').css("display","none");
				ajaxSubmit("formEstmSave");
				return false;
			}else if(job!="mod"){
				$('.layerPopup').fadeOut();
				if(deviceType=="app"){
					setTimeout(function() {
						ajaxSubmit("formEstmSave");
		    		}, 500);
				}else{
					ajaxSubmit("formEstmSave");
				}
				return false;
			}
		}
	});
	
	// 기본 설정
	$(document).on("click", "#estmBtnConfig", function () {
		getConfigForm();
	});
	$(document).on("click", "#formEstmConfig button", function () {
		if(confirm("다음 견적부터 반영됩니다. 설정을 저장하시겠습니까?")){
			ajaxSubmit("formEstmConfig");
		}
		return false;
	});
	
	// 견적 모드 변경
    $(document).on("click", "#changeGoods", function () {
    	if(typeof(estmCode.trim)=="undefined"){
    		window.location.href = "/newcar/estimate/"+$(this).attr("goods");
		}else{
			if(confirm("트림과 색상, 옵션까지만 승계됩니다(할인, 직접입력 제외). 현재 페이지가 "+$(this).text()+"으로 이동되어 작성하던 견적이 사라집니다. "+$(this).text()+"로 이동하시겠습니까?")){
				var str = "model\t"+estmRslt.model;
		    	str += "\ntrim\t"+estmRslt.trim+"\noption\t"+estmRslt.option+"\ncolorExt\t"+estmRslt.colorExt+"\ncolorInt\t"+estmRslt.colorInt;
		    	$.cookie("start", str, {path: "/", domain: location.host});
		    	window.location.href = "/newcar/estimate/"+$(this).attr("goods");
	    	}
		}
    });
    // 즉시출고에서 이동
    $(document).on("click", "#fastshipView .contract > button", function () {
		if(confirm("견적으로 이동됩니다. 다른 트림이나 옵션, 색상으로 변경하면 선구매•즉시출고로 취급되지 않습니다. 다른 차량으로 변경하시려면 이 화면에서 다시 선택해 주셔야 합니다.")){
			var model = $(this).parent().parent().attr('model');
			var trim = $(this).parent().parent().attr('trim');
			var colorExt = $(this).parent().parent().attr('colorExt');
			var colorInt = $(this).parent().parent().attr('colorInt');
			var option = $(this).parent().parent().attr('option');
			var kind = $(this).parent().parent().attr('kind');
			var str = "model\t"+model;
	    	str += "\ntrim\t"+trim+"\noption\t"+option+"\ncolorExt\t"+colorExt+"\ncolorInt\t"+colorInt;
	    	str += "\nfastship\t"+$(this).text();
	    	str += "\nfastKind\t"+kind;
	    	$.cookie("start", str, {path: "/", domain: location.host});
	    	window.location.href = "/newcar/estimate/rent";
    	}
    });
    
 // 즉시출고에서 이동
    $(document).on("click", ".viewConfigMemo", function () {
    	var fNo = parseInt($(this).closest(".fincCell").attr("fincNo"));
    	var str = "<div class='infoPopup'>";
		str += "<div><b>차량선택</b></div>";
		str += "<div>"+estmConfig[estmNow]['memo']+"</div>";
		str += "<div><br><b>공통선택</b></div>";
		str += "<div>"+fincConfig[estmNow][0]['memo']+"</div>";
		str += "<div><br><b>상품선택</b></div>";
		str += "<div>"+fincConfig[estmNow][fNo]['memo']+"</div>";
		str += "</div>";
		$("#framePopup h3").text(fNo+" 견적 내역");
		$("#framePopup .content").html(str);
		openPopupView(800,'framePopup');
    });
    
    // 
});
// 가격표에서 넘어와서 견적 시작하기
function startEstimate(dat){
	estmChangeKind = "start";
	var tmp = dat.split("\n");
	start = {};
	for(var t in tmp){
		var val = tmp[t].split("\t");
		start[val[0]] = val[1];
	}
	if(typeof(start.fastship)!="undefined"){
		defaultCfg['issueType'] = "S";		// 출고(직판)
		$obj = $("#estmBody .estmCell[estmNo='"+estmNow+"']");
		$obj.find("input[name='issueType']").prop("checked",false);
		$obj.find("input[name='issueType'][value='S']").prop("checked",true);
	}
	if(typeof(start.model)!="undefined"){
		var url = "/api/auto/modelData_"+start.model+"?token="+token;
		var Dpath = "modelData"+start.model;
		getjsonData(url,Dpath);
		var $obj = $("#estmBody .estmCell[estmNo='"+estmNow+"']");
		if(typeof(start.trim)!="undefined"){
			estmCode = {};
	    	estmCode['trim'] = start.trim;
	    	estmCode['lineup'] =  dataBank[Dpath]['trim'][start.trim]['lineup'];
	    	estmCode['model'] = start.model;
	    	estmCode['brand'] = dataBank[Dpath]['model'][start.model]['brand'];
	    	
	    	$obj.find(".selbar[kind='trim']").attr("code",estmCode.trim);
	    	$obj.find(".selbar[kind='lineup']").attr("code",estmCode.lineup);
	    	$obj.find(".selbar[kind='model']").attr("code",estmCode.model);
	    	$obj.find(".selbar[kind='brand']").attr("code",estmCode.brand);
	    	var oList = "";
			if(typeof(start.option)!="undefined" && start.option){
				tmp =  dataBank[Dpath]['trim'][start.trim]['option'].split("\n");
				for(var c in tmp){
					var val = tmp[c].split("\t");
					if(start.option.indexOf(val[0])>=0){
						var dat = dataBank[Dpath]['option'][val[0]];
						if(oList != "") oList +="\n";
						oList += val[0]+"\t"+val[1]+"\t"+dat.name+"\t"+val[2];
					}
				}
			}
			estmConfig[estmNow]['option'] = oList;
			var ext = "";
			if(typeof(start.colorExt)!="undefined" && start.colorExt){
				if(typeof(dataBank[Dpath]['trim'][estmCode['trim']]['colorExt'])!="undefined") color = dataBank[Dpath]['trim'][estmCode['trim']]['colorExt'];
				else if(typeof(dataBank[Dpath]['lineup'][estmCode['lineup']]['colorExt'])!="undefined") color = dataBank[Dpath]['lineup'][estmCode['lineup']]['colorExt'];
				else color = dataBank[Dpath]['model'][estmCode['model']]['colorExt'];
				tmp = color.split("\n");
				for(var c in tmp){
					var val = tmp[c].split("\t");
					if(start.colorExt==val[0]){
						var dat = dataBank[Dpath]['colorExt'][val[0]];
						if(dat.code) var code = "("+dat.code+")";
						else var code = "";
						if(dat.group) code += " - "+dat.group;
						var rgb =dat.rgb+"/"+dat.rgb2;
						ext = val[0]+"\t"+val[1]+"\t"+dat.name+code+"\t"+rgb; 
					}
				}
			}
			estmConfig[estmNow]['colorExt'] = ext;
			var int = "";
			if(typeof(start.colorInt)!="undefined" && start.colorInt){
				if(typeof(dataBank[Dpath]['trim'][estmCode['trim']]['colorInt'])!="undefined") color = dataBank[Dpath]['trim'][estmCode['trim']]['colorInt'];
				else if(typeof(dataBank[Dpath]['lineup'][estmCode['lineup']]['colorInt'])!="undefined") color = dataBank[Dpath]['lineup'][estmCode['lineup']]['colorInt'];
				else color = dataBank[Dpath]['model'][estmCode['model']]['colorInt'];
				tmp = color.split("\n");
				for(var c in tmp){
					var val = tmp[c].split("\t");
					if(start.colorInt==val[0]){
						var dat = dataBank[Dpath]['colorInt'][val[0]];
						if(dat.code) var code = "("+dat.code+")";
						else var code = "";
						if(dat.group) code += " - "+dat.group;
						var rgb =dat.rgb+"/"+dat.rgb2;
						int = val[0]+"\t"+val[1]+"\t"+dat.name+code+"\t"+rgb; 
					}
				}
			}
			estmConfig[estmNow]['colorInt'] = int;
	    	arrangeEstmData("trim",estmCode['trim'])
			//arrangeView();
		}
	}
	//$.cookie("start", "", {path: "/", domain: location.host});
	//$.removeCookie("start", {path: "/", domain: location.host});
}
//견적 변수 저장
function saveEstmDataForm(){
	var dat = {};
	dat['estmData'] = estmData[estmNow];
	dat['estmCfg'] = estmConfig[estmNow];
	dat['fincData'] = fincData[estmNow];
	dat['fincCfg'] = fincConfig[estmNow];
	if(deviceType=="app"){
		sendDataToRight("data",window.btoa(encodeURIComponent(JSON.stringify(dat))));
	}else{
		$("#formEstmSave textarea[name='data']").val(JSON.stringify(dat));
	}
}
//견적 변수 저장
function saveEstmDocuForm(){
	var model = $("#estmDocu .eModel").text();
	var docu = $("#estmDocu .estmRslt_estmDocu").html();
	$("#formEstmSave input[name='model']").val(model);
	$("#formEstmSave textarea[name='document']").val(docu);
}

// 견적 저장 리턴
function estmActReturn(job,no,key,type){
	var url = urlHost+"/D/E/"+key;
	if(job=="mod"){
		window.location.href = $("#metaUrl").attr("content");
		return false;
	}else{
		estmConfig[estmNow]['saveNo'] = no;
		estmConfig[estmNow]['viewKey'] = key;
		
		$("#estmDocu .urlBox").removeClass("off");
		$("#estmDocu .urlBox input[name='shortcut']").val(url);
		if(deviceType=="app") $("#estmDocu .urlBox .urlOpen").attr("href",url+"?webview=layer");
		else $("#estmDocu .urlBox .urlOpen").attr("href",url);
		$("#estmDocu .btnEstmAct[job='url']").addClass("off");
		$("#estmDocu .btnEstmAct[job='save']").text("저장됨");
		if(deviceType=="app"){
			sendConfigToMain("saveNo",no,"");
		}
	}
	/*
	if(type=="save" || type=="right"){
		if(deviceType=="app" && type=="save"){
			$obj = $("#estmBody .estmCell[estmNo='"+estmNow+"']");
			if(tab.substring(0,1)=="M") $("#estmBody").attr("saveM",no);
			else $obj.attr("saveNo",no);
			var view = "main";
			var func = "estmActReturn";
			var cfg = {};
			cfg['job']=job;
			cfg['no']=no;
			cfg['key']=key;
			cfg['tab']=tab;
			cfg['type']="right";
			cfg['cNo']=cNo;
			cfg['subj']=subj;
			cfg['vars']="job,no,key,tab,type,cNo,subj";
			var dataJ = JSON.stringify(cfg);
			window.app.callWebToWeb(view,func,dataJ);
		}
		if(type!="right"){
			if(tab.substring(0,1)=="M") estmDoc['M'][tab] = key;
			else estmDoc[estmNow][tab] = key;
			$("#estmDocu .urlBox").removeClass("off");
			$("#estmDocu .urlBox input[name='shortcut']").val("http://m.ca8.kr/"+key);
			if(deviceType=="app") $("#estmDocu .urlBox .urlOpen").attr("href","http://m.ca8.kr/"+key+"?webview=layer");
			else $("#estmDocu .urlBox .urlOpen").attr("href","http://m.ca8.kr/"+key);
			$("#estmDocu .btnEstmAct[job='url']").addClass("off");
			$("#estmDocu .btnEstmAct[job='save']").text("저장됨");
			if(job=="save"){
				alertPopup("<div>견적이 저장되었습니다. <br><br>저장된 견적은 마이페이지에서 확인하실 수 있습니다.</div>");
			}
		}
		if(deviceType!="app" || type=="right"){
			if(tab.substring(0,1)=="M"){
				$("#estmBody").attr("saveM",no);
			}else{
				$obj = $("#estmBody .estmCell[estmNo='"+estmNow+"']");
				if(subj) $obj.find(".estmSave_subject").text(subj);
				else $obj.find(".estmSave_subject").text("차량선택");
				$obj.attr("saveNo",no);
				$obj.find(".estmRslt_estmNo").text(no);
				$("#estmList li[estmNo='"+estmNow+"'] .no").text(no);
				$("#saveSubject").val(subj);
			}
		}
	}
	*/
	if(job=="save"){
		alertPopup("<div>견적이 저장되었습니다. 저장견적에서 확인하실 수 있습니다.</div>");
	}else if(job=="url" || job=="pdf" || job=="jpg" || job=="print"){
		$('.layerPopup').css("display","none");
		//var url = "http://m.ca8.kr/"+key;
		//$("#framePopup h3").text(url);
		url +="?v="+job;
		if(deviceType=="app"){
			url +="&webview=layer";
			window.location.href = url;
		}else if(type!="right"){
			newWindow = window.open(url, "_blank");
			newWindow.focus();
		}
		
    	/*
		var str ='<iframe src="'+url+'" style="width:100%; height:600px" srcrolling="auto" onload="" frameborder="0" border="0" bordercolor="#000000" marginwidth="0" marginheight="0" name="carpanPopup" ></iframe>';
		$("#framePopup .content").html(str);
		openPopupView(920,'framePopup');
		*/
	}else if(job=="talk"){
		$('.layerPopup').css("display","none");
		//if(deviceType=="app"){
		//	alert(window.app.isInstalledKakaotalk());		true false
		//}
		sendKakao(key,type);
	}else if(job=="finc"){
		viewApiData(dataBank['jsonData']);
		alertPopup("<div>고객님께 동의 url이 전송되었습니다. <br><br>고객님께 안내 바랍니다.<br><a href='"+dataBank['jsonData']['url']+"' target='_blank'>"+dataBank['jsonData']['url']+"</a></div>");
	}else if(job=="sms" && $("#formEstmSave input[name='way']").val()=="app"){
		var num = number_only($("#formEstmSave input[name='to']").val()).replace(/-/g,'');
		var msg = $("#formEstmSave textarea[name='msg']").val();
		msg +="\nhttp://m.ca8.kr/"+key;
		window.app.sendSMS(msg,num);
	}else if(job=="sms"){
		alertPopup("<div>문자 발송이 접수되었습니다.<br><br>발송에 약간의 시간이 소요됩니다. 저장발송에서 발송 결과를 확인하실 수 있습니다.</div>");
	}else if(job=="fax"){
		alertPopup("<div>팩스 발송이 접수되었습니다.<br><br>발송에 약간의 시간이 소요됩니다. 저장발송에서 발송 결과를 확인하실 수 있습니다.</div>");
	}
}

// 제원 보기
function viewSpecEstm(model,spc){
	var spec = spc.split(",");
	var str = "<div class='infoPopup'>";
	if(spec[0] || spec[1] || spec[2]){
		str += "<div class='spec'>";
		str += "<div class='left'>\n";
		if(spec[0]){
			str += "<div class='name'>외관</div><dl>";
			var tmp = dataBank['modelData'+model]['specGroup'][1853]['list'].split(",");
			var dat = dataBank['modelData'+model]['spec'][spec[0]];
			for(var s in tmp){
				var set = dataBank['modelData'+model]['specDefine'][tmp[s]];
				if(typeof(dat[tmp[s]])!="undefined" && set.name.indexOf("윤거")<0){
					if(set.unit) str += "<dt>"+set.name+"("+set.unit+")</dt> <dd>"+dat[tmp[s]]+"</dd>";
					else str += "<dt>"+set.name+"</dt> <dd>"+dat[tmp[s]]+"</dd>";
				}
			}
			str += "</dl>\n";
		}
		if(spec[1]){
			str += "<div class='name'>엔진</div><dl>";
			var tmp = dataBank['modelData'+model]['specGroup'][1854]['list'].split(",");
			var dat = dataBank['modelData'+model]['spec'][spec[1]];
			for(var s in tmp){
				var set = dataBank['modelData'+model]['specDefine'][tmp[s]];
				if(typeof(dat[tmp[s]])!="undefined"){
					//if(set.unit) set.name+= "("+set.unit+")";
					//str += "<dt>"+set.name+"</dt> <dd>"+dat[tmp[s]]+"</dd>";
					if(set.unit) str += "<dt>"+set.name+"("+set.unit+")</dt> <dd>"+dat[tmp[s]]+"</dd>";
					else str += "<dt>"+set.name+"</dt> <dd>"+dat[tmp[s]]+"</dd>";
				}
			}
			str += "</dl>\n";
		}
		str += "</div>\n";
		str += "<div class='right'>\n";
		if(spec[2]){
			str += "<div class='name'>연비</div><dl>";
			var tmp = dataBank['modelData'+model]['specGroup'][1855]['list'].split(",");
			var dat = dataBank['modelData'+model]['spec'][spec[2]];
			for(var s in tmp){
				var set = dataBank['modelData'+model]['specDefine'][tmp[s]];
				if(typeof(dat[tmp[s]])!="undefined"){
					//if(set.unit) set.name+= "("+set.unit+")";
					//str += "<dt>"+set.name+"</dt> <dd>"+dat[tmp[s]]+"</dd>";
					if(set.unit) str += "<dt>"+set.name+"("+set.unit+")</dt> <dd>"+dat[tmp[s]]+"</dd>";
					else str += "<dt>"+set.name+"</dt> <dd>"+dat[tmp[s]]+"</dd>";
				}
			}
			str += "</dl>\n";
		}
		str += "</div>";
		str += "</div>\n";
	}
	
	return str;
}
//외장색상 선택 저장
function getColorExtCode(){
	var code = "";
	$col = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .colorExtSel li.on");
	if($col.length){
		code += $col.attr("colorExt")+"\t";
		code += $col.attr("price")+"\t";
		code += $col.find(".name").text()+"\t";
		code += $col.attr("rgb");
	}
	estmConfig[estmNow]['colorExt'] = code;
	//$("#estmBody .estmCell[estmNo='"+estmNow+"']").find(".estmRslt_data [name='colorExt']").val(code);
}
// 내장색상 선택 저장
function getColorIntCode(){
	var code = "";
	$col = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .colorIntSel li.on");
	if($col.length){
		code += $col.attr("colorInt")+"\t";
		code += $col.attr("price")+"\t";
		code += $col.find(".name").text()+"\t";
		code += $col.attr("rgb");
	}
	estmConfig[estmNow]['colorInt'] = code;
	//$("#estmBody .estmCell[estmNo='"+estmNow+"']").find(".estmRslt_data [name='colorInt']").val(code);
}
//옵션 선택 저장
function getOptionCode(){
	var code = "";
	var $obj = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .optionSel li.on:not(.off)");
	$obj.each(function (){
		var option = $(this).attr("option");
		var price = $(this).attr("price");
		var name = $(this).find(".name").text();
		var apply = $(this).attr("apply");
		if(code) code +="\n";
		code +=option+"\t"+parseInt(price)+"\t"+name+"\t"+apply;
	});
	estmConfig[estmNow]['option'] = code;
	//$("#estmBody .estmCell[estmNo='"+estmNow+"']").find(".estmRslt_data [name='option']").val(code);
}
//할인 선택 저장
function getDiscountCode(){
	var code = 0;
	var $obj = $("#estmBody .estmCell[estmNo='"+estmNow+"'] .discountSel > li:not(.off) > ul > li.on");
	$obj.each(function (){
		code = number_filter($(this).find("input").val());
	});
	estmConfig[estmNow]['discount'] = code;
}
// 공통선택 저장
function getComnConfig(kind,data,etc){
	if(kind=="insure" || kind=="accessory" || kind=="modify" || kind=="incentive" || etc=="deliveryAddCost"){
		fincConfig[estmNow][0][etc] = data;
	}else if(kind=="careParts"){
		var cod = "";
		$("#estmBody .estmCell[estmNo='"+estmNow+"'] .careList[etc='careParts'] li.on").each(function (){
			if(cod) cod += ",";
			cod += $(this).attr('careParts');
		});
		fincConfig[estmNow][0]['careParts'] = cod;
	}else{
		fincConfig[estmNow][0][kind] = data;
	}
}
// 리스렌트 비교 저장
function getLoanConfig(kind,data,etc){		// kind, data, etc
	if(kind=="mode"){
		
	}else{
		fincConfig[estmNow][fincNow[estmNow]][kind] = data;
	}
}

// 선택 클릭 후 변경시 실행
function arrangeEstmData(kind,code){
	// arrangeEstmData('brand',$(this).parent().attr("brand"));
	var $obj = $("#estmBody .estmCell[estmNo='"+estmNow+"']");
	// console.log(kind+" => "+code);
	var $objS = $obj.find("."+kind+"Sel");
	$objS.find("li.on").removeClass("on");
	var $objN = $objS.find("li["+kind+"='"+code+"']");
	$objN.addClass("on");
	var $objD = $obj.find(".selbar[kind='"+kind+"']");
	$objD.attr("code",code);
	// 선택된 데이터 표시하기
	if(kind=="brand"){
		$objD.find(".bar").html($objN.find("button").html());
	}else if(kind=="model"){
		estmChangeKind = "model";
		$objD.find(".bar").html($objN.find(".name").html());
	}else if(kind=="lineup"){
		$objD.find(".bar").html($objN.find("span").html());
	}else if(kind=="trim"){
		$objD.find(".bar").html($objN.find(".name").text()+" <span class='price'>"+$objN.find(".price").text()+"</span>");
	}
	
	if(kind=="brand"){	// 모델 초기화
		$obj.find(".selbar[kind='model']").attr("code","");
		var $objM = $obj.find(".modelSel");
		$objM.html("");
		$objM.attr("brand","");
		$obj.find(".selbar[kind='model'] .bar").html("<span class='blank'>선택해 주세요.</span>");
	}
	if(kind=="brand" || kind=="model"){	// 라인업 초기화
		$obj.find(".selbar[kind='lineup']").attr("code","");
		var $objL = $obj.find(".lineupSel");
		$objL.html("");
		$objL.attr("model","");
		$obj.find(".selbar[kind='lineup'] .bar").html("<span class='blank'>선택해 주세요.</span>");
		estmCode = {};
	}
	if(kind=="brand" || kind=="model" || kind=="lineup"){	// 트림 초기화
		$obj.find(".selbar[kind='trim']").attr("code","");
		var $objT = $obj.find(".trimSel");
		$objT.html("");
		$objT.attr("lineup","");
		$obj.find(".selbar[kind='trim'] .bar").html("<span class='blank'>선택해 주세요.</span>");
		resetEstmUnit();
	}
	if(kind=='trim'){	// 견적 계산 시작
		var modelOld = 0;
		if(typeof(estmCode['model'])!="undefined")  modelOld = estmCode['model'];
		var trimOld = 0;
		if(typeof(estmCode['trim'])!="undefined")  trimOld = estmCode['trim'];
		estmCode = {};
		estmCode['trim'] = parseInt(code);
    	estmCode['lineup'] = parseInt($obj.find(".selbar[kind='lineup']").attr("code"));
    	estmCode['model'] = parseInt($obj.find(".selbar[kind='model']").attr("code"));
    	estmCode['brand'] = parseInt($obj.find(".selbar[kind='brand']").attr("code"));
    	//console.log(estmCode);
    	// 외장/내장/옵션/할인/탁송료 목록 작성
    	$obj.find(".colorExtSel").html(getColorList( estmCode.model, estmCode.lineup, estmCode.trim, 'Ext' ));
    	$obj.find(".colorIntSel").html(getColorList( estmCode.model, estmCode.lineup, estmCode.trim, 'Int' ));
    	$obj.find(".optionSel").html(getOptionList( estmCode.model, estmCode.lineup, estmCode.trim ));
    	// $obj.find(".discountSel").html(getDiscountList(estmCode.brand, estmCode.model,  estmCode.lineup, estmCode.trim ));	미사용
    	// 잔가율 가져요기
    	//if(estmMode=="rent") getApiModelRemain(estmCode);
    	if(trimOld==0 || estmChangeKind=="startUrl"  || estmChangeKind=="start"){
    		// 계산 처음 시작
    		estmCode['change'] = "start";
    	}else if(trimOld == estmCode['trim']){
    		estmCode['change'] = "open";
    	}else{
    		estmCode['change'] = "trim";
    	}
    	if(estmMode != "fastship" && estmCode['model']==modelOld){	// 불러오기, 기존 승계
    		if(typeof(estmConfig[estmNow]['colorExt'])!="undefined" && estmConfig[estmNow]['colorExt']){
    			var val = estmConfig[estmNow]['colorExt'].split("\t");
            	if(val[0].substr(0,1)=="S") $obj.find(".colorExtSel .selfBox").before(makeSelfColor("colorExt",val[0],val[2],val[1]));
    			$obj.find(".colorExtSel li[colorExt='"+val[0]+"']").addClass("on");
    			getColorExtCode();
    		}
    		if(typeof(estmConfig[estmNow]['colorInt'])!="undefined" && estmConfig[estmNow]['colorInt']){
    			var val = estmConfig[estmNow]['colorInt'].split("\t");
    			if(val[0].substr(0,1)=="S") $obj.find(".colorIntSel .selfBox").before(makeSelfColor("colorInt",val[0],val[2],val[1]));
    			$obj.find(".colorIntSel li[colorInt='"+val[0]+"']").addClass("on");
    			getColorIntCode();
    		}
    		if(typeof(estmConfig[estmNow]['option'])!="undefined" && estmConfig[estmNow]['option']){
    			var dat = estmConfig[estmNow]['option'].split("\n");
    			for(var n in dat){
    				var val = dat[n].split("\t");
    				if(val[0].substr(0,1)=="S") $obj.find(".optionSel .selfBox").before(makeSelfOption(val[0],val[2],val[1])); 
        			$obj.find(".optionSel li[option='"+val[0]+"']").addClass("on");
    			}
    			getOptionCode();
    		}
    	}else{
    		estmConfig[estmNow]['colorExt']="";
    		estmConfig[estmNow]['colorInt']="";
    		estmConfig[estmNow]['option']="";
    		estmConfig[estmNow]['discount'] = 0;
    		$obj.find(".discountSel li").removeClass("on");
    	}
    	// 필수 선택 옵션 체크 (* 으로 시작 apply)
    	if($obj.find(".optionSel li[apply^='*']").length){
    		$obj.find(".optionSel li[apply^='*']").addClass("on");
    		getOptionCode();
    	}
    	
    	// 리스렌트 전용 승계
    	if(estmStart['mode']=="leaserent" && estmCode['trim']==trimOld){
    		var issue = $obj.find(".estmRslt_data [name='issue']").val();
    		$obj.find(".issueType input[type='radio']").prop("checked",false);
			$obj.find(".issueType input[type='radio'][value='"+issue+"']").prop("checked",true);
			if(issue=="D"){
				$obj.find(".transType input[type='radio'][value='BD']").prop("checked",true);
				$obj.find(".transType input[type='radio'][value='BD']").prop("disabled",false);
				$obj.find(".transType input[type='radio'][value='OD']").prop("checked",false);
				$obj.find(".transType input[type='radio'][value='OD']").prop("disabled",true);
				$obj.find(".transBD").removeClass("off");
	    		$obj.find(".transOD").addClass("off");
			}else{
				$obj.find(".transType input[type='radio'][value='BD']").prop("checked",false);
				$obj.find(".transType input[type='radio'][value='BD']").prop("disabled",true);
				$obj.find(".transType input[type='radio'][value='OD']").prop("checked",true);
				$obj.find(".transType input[type='radio'][value='OD']").prop("disabled",false);
				$obj.find(".transBD").addClass("off");
	    		$obj.find(".transOD").removeClass("off");
			}
			var val = $obj.find(".estmRslt_data [name='taxFree']").val().split("\t");
			if(val[0].indexOf("T")>1) $obj.find("input[name='tax5']").prop("checked",true);
			if(val[0].indexOf("S")>1) $obj.find("input[name='tax3']").prop("checked",true);
			if(val[0].indexOf("Q")>1) $obj.find("input[name='tax7']").prop("checked",true);
    	}
    	// scrollUp
    	$obj.find(".scroll .cont").scrollTop(0);
    	$obj.find(".selsub[kind='taxfreeSel']").attr("code","");
    	$obj.find(".selsub[kind='taxfreeSel']").attr("code","");
    	
    	if(estmChangeKind != "startUrl") calculator();
	}
	
}
// 선택 변경시 화면 표시 초기화
function resetEstmUnit(){
	var $obj = $("#estmBody .estmCell[estmNo='"+estmNow+"']");
	$obj.find(".estmRslt_colorExt").html("<span class='blank'>선택해 주세요.</span>");
	$("#estmBody .estmCell[estmNo='"+estmNow+"'] .colorExtSel").html("");
	$obj.find(".estmRslt_colorInt").html("<span class='blank'>선택해 주세요.</span>");
	$("#estmBody .estmCell[estmNo='"+estmNow+"'] .colorIntSel").html("");
	$obj.find(".estmRslt_trimPrice").html("0");
	$("#estmBody .estmCell[estmNo='"+estmNow+"'] .optionSel").html("");
	
	$obj.find(".estmRslt_taxFreeCost").text("0");
	$obj.find(".estmRslt_vehicleVat").text("0");
	$obj.find(".estmRslt_vehiclePay").text("0");
	$obj.find(".estmRslt_takeSum").text("0");
	$obj.find(".estmRslt_costSum").text("0");
	$obj.find(".estmRslt_pmtPay").text("0");
	$obj.find(".estmRslt_pmtHPay").text("");
	$obj.find(".estmRslt_paySum").text("0");
	
	$(".wrapper").removeClass("use");
	$("#estmBox").removeClass("open");
}



