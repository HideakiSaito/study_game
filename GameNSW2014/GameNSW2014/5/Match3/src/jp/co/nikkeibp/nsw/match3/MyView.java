package jp.co.nikkeibp.nsw.match3;

import android.content.Context;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.view.MotionEvent;
import android.view.View;

public class MyView extends View {
	private Match3 match3 = new Match3();
	private Bitmap[] droid = new Bitmap[6];
	private Paint paint = new Paint();
	private Paint redPaint = new Paint();
	private int sX, sY, eX, eY;
	private int animeState = 1;
	
	public MyView(Context context) {
		super(context);
		match3.init();
		setBackgroundColor(Color.WHITE);
		Resources r = getResources();
		droid[0] = BitmapFactory.decodeResource(r, R.drawable.i0);
		droid[1] = BitmapFactory.decodeResource(r, R.drawable.i1);
		droid[2] = BitmapFactory.decodeResource(r, R.drawable.i2);
		droid[3] = BitmapFactory.decodeResource(r, R.drawable.i3);
		droid[4] = BitmapFactory.decodeResource(r, R.drawable.i4);
		droid[5] = BitmapFactory.decodeResource(r, R.drawable.i5);
		paint.setARGB(255, 255, 255, 255);
		redPaint.setARGB(96, 255, 0, 0);
	}

	public boolean onTouchEvent(MotionEvent e) {	
		if(animeState==1) { return false; }
		
    	int x = (int)e.getX();
    	int y = (int)e.getY();
		if(y > 12 * 100 || x > 8 * 100) { return true; }
		switch (e.getAction()) {
        case MotionEvent.ACTION_DOWN:
        	sX = x / 100;
        	sY = y / 100;
        	break;
        case MotionEvent.ACTION_UP:
        	eX = x / 100;
        	eY = y / 100;
       		if(match3.swapBlocks(sX, sY, eX, eY)) {
       			animeState = 1;
        	}
        	break;
		}
		return true;
	}
	
	public void doAnime() {
		switch(animeState) {
		case 0:
			break;
		case 1:
		    match3.deleteBlocks();
		    stop(300);
		    animeState = 2;
		    break;
		case 2:
		    match3.downBlocks();
		    stop(200);
		    if(match3.isDeleteBlocks()) { 
		    	animeState = 1; 
		    } else {
		    	animeState = 3;
		    }
			break;
		case 3:
			match3.newBlocks();
			stop(100);
			animeState = 4;
			break;
		case 4:
			if(match3.isDownNewBlocks()) {
				animeState = 2;
			} else {
				if(match3.isDeleteBlocks()) { 
					animeState = 1;
				} else {
					animeState = 0; 
				}
			}
			break;
		}	
	}
	
	public void stop(int time) {
		try {
	    	Thread.sleep(time);
	    } catch (InterruptedException e) {}
	}
	
	protected void onDraw(Canvas canvas) {
		super.onDraw(canvas);	
		for(int x=0; x<8; x++) {
			for(int y=0; y<12; y++) {
				int n = match3.getPanelNum(x, y);
				if(n==9) {
					canvas.drawRect(x*100, y*100, x*100+100, y*100+100, paint);
				} else if(n>99) {
					canvas.drawRect(x*100, y*100, x*100+100, y*100+100, redPaint);
					match3.setPanelNum(x, y, 9);
					canvas.drawBitmap(droid[n-100], x*100, y*100, paint);
				} else {
					canvas.drawBitmap(droid[n], x*100, y*100, paint);
				} 
			}
		}
		doAnime();
		invalidate();
	}
}





