package cn.git.flow.helper;

import cn.com.git.udmp.bizflow.data.DataObject;

public class TestLocalServiceResponser extends DataObject{
	public String getName(){
		return getString("name");
	}
	
	public void setName(String name){
		setString("name", name);
	}
}
