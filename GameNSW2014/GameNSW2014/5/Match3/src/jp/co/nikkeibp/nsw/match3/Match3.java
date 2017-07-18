package jp.co.nikkeibp.nsw.match3;

import java.util.Random;

public class Match3 {
	private int[][] panel = new int[12][8];
	private int[][] checkPanel = new int[12][8];
	private int checkCountH, checkCountV;
	Random rand = new Random();
	
	public void init() {
		for(int x=0; x<8; x++) {
			for(int y=0; y<12; y++) {
				panel[y][x] = rand.nextInt(5);
			}
		}
	}
	
	public int getPanelNum(int x, int y) { return panel[y][x]; }
	
	public void setPanelNum(int x, int y, int n) { 
		panel[y][x] = n; 
	}
	
	public boolean swapBlocks(int x1, int y1, int x2, int y2) {
		if(panel[y1][x1]==9 || panel[y2][x2]==9) {
			return false;
		}
		if((Math.abs(x1-x2)==1 && Math.abs(y1-y2)==0) ||
     	   (Math.abs(x1-x2)==0 && Math.abs(y1-y2)==1)) {
			int t = panel[y1][x1];
			panel[y1][x1] = panel[y2][x2];
			panel[y2][x2] = t;
			boolean flag1 = isSwapBlocks(x1, y1);
			boolean flag2 = isSwapBlocks(x2, y2);
			if(flag1==false && flag2==false) {
				t = panel[y1][x1];
				panel[y1][x1] = panel[y2][x2];
				panel[y2][x2] = t;
				return false;
			}
			return true;
		} else {
			return false;	
		}
	}
	
	public void newBlocks() {
		for(int x=0; x<8; x++) {
			if(panel[0][x]==9) {
				panel[0][x] = rand.nextInt(5);
			}
		}
	}
	
	public boolean isDownNewBlocks() {
		for(int x=0; x<8; x++) {
			for(int y=0; y<12; y++) {
				if(panel[y][x]==9) {
					return true;
				}
			}
		}
		return false;
	}
	
	public void downBlocks() {
		boolean flag = true;
		while(flag) {
			flag = false;
			for(int x=0; x<8; x++) {
				for(int y=11; y>0; y--) {
					if(panel[y][x]==9 && panel[y-1][x]!=9) {
						panel[y][x] = panel[y-1][x];
						panel[y-1][x] = 9;
						flag = true;
					}
				}
			}
		}
	}
	
	public boolean isDeleteBlocks() {
		int count=0, n;
		for(int y=0; y<12; y++) {
			for(int x=0; x<6; x++) {
				n = panel[y][x];
				count++;
				while(n!=9 && n==panel[y][x+count]) {
					count++;
					if((x+count)==8) { break; }
				}
				if(count >= 3) { return true; }
				count = 0;
			}
		}	
		for(int x=0; x<8; x++) {
			for(int y=0; y<10; y++) {
				n = panel[y][x];
				count++;
				while(n!=9 && n==panel[y+count][x]) {
					count++;
					if((y+count)==12) { break; }
				}
				if(count >= 3) { return true; }
				count = 0;
			}
		}
		return false;
	}
	
	public void deleteBlocks() {
		int count=0, n;
		for(int y=0; y<12; y++) {
			for(int x=0; x<6; x++) {
				n = panel[y][x];
				count++;
				while(n==panel[y][x+count]) {
					count++;
					if((x+count)==8) { break; }
				}
				if(count >= 3) {
					for(int i=0; i<count; i++) {
						checkPanel[y][x+i] = 1;
					}
				}
				count = 0;
			}
		}	
		for(int x=0; x<8; x++) {
			for(int y=0; y<10; y++) {
				n = panel[y][x];
				count++;
				while(n==panel[y+count][x]) {
					count++;
					if((y+count)==12) { break; }
				}
				if(count >= 3) {
					for(int i=0; i<count; i++) {
						checkPanel[y+i][x] = 1;
					}
				}
				count = 0;
			}
		}	
		
		for(int x=0; x<8; x++) {
			for(int y=0; y<12; y++) {
				if(checkPanel[y][x]==1 && panel[y][x]!=9) {
					panel[y][x] = panel[y][x] + 100;
				}
			}
		}
		clearCheckPanel();
	}
	
	private void clearCheckPanel() {
		for(int x=0; x<8; x++) {
			for(int y=0; y<12; y++) {
				checkPanel[y][x] = 0;
			}
		}	
	}
	
	private void checkH(int x, int y) {
		int n = panel[y][x];
		checkPanel[y][x] = 1;
		checkCountH++;
		if(x!=7 && panel[y][x+1]==n && checkPanel[y][x+1]!=1) { 
			checkH(x+1, y); 
		}
		if(x!=0 && panel[y][x-1]==n && checkPanel[y][x-1]!=1) { 
			checkH(x-1, y); 
		}	
	}
	
	private void checkV(int x, int y) {
		int n = panel[y][x];
		checkPanel[y][x] = 1;
		checkCountV++;
		if(y!=11 && panel[y+1][x]==n && checkPanel[y+1][x]!=1) { 
			checkV(x, y+1); 
		}
		if(y!=0 && panel[y-1][x]==n && checkPanel[y-1][x]!=1) { 
			checkV(x, y-1); 
		}	
	}
	
	private boolean isSwapBlocks(int x, int y) {
		checkH(x, y);
		clearCheckPanel();
		checkV(x, y);
		clearCheckPanel();
		if(checkCountH >= 3 || checkCountV >= 3) {
			checkCountH = checkCountV = 0;
			return true;
		} else {
			checkCountH = checkCountV = 0;
			return false;
		}
	}			
}





















