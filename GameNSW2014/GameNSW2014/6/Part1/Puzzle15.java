import java.util.Deque;
import java.util.HashSet;
import java.util.Hashtable;
import java.util.LinkedList;
import java.util.Map;
import java.util.Set;

public class Puzzle15 {
	static String startBoard;
	static String finalBoard = "123456789ABCDEF0";
	static Deque<String> queue = new LinkedList<String>();
	static Set<String> set = new HashSet<String>();
	static Map<String, String> route = new Hashtable<String, String>();
	static int sp;
	static final int LEFT = -1;
	static final int RIGHT = 1;
	static final int UP = -4;
	static final int DOWN = 4;
	
	public static void main(String[] args) {
		startBoard = args[0];
		System.out.println("スタート！");
		
	    queue.offer(startBoard);

	    while(solve()){ }
	    
	    Deque<String> list = new LinkedList<String>();
	    list.push(finalBoard);
	    String b = route.get(finalBoard);
	    while(!b.equals(startBoard)){
	    	list.push(b);
	    	b = route.get(b);
	    }
	    list.push(startBoard);
	    System.out.println(list.size() -1 +"ステップで解けました");
	    for(String s : list){
	    	System.out.println(s);
	    }
	}
	
	static void move(String board, int dir){
		StringBuilder b = new StringBuilder(board);
		char c = b.charAt(sp + dir);
		b.setCharAt(sp + dir, '0');
		b.setCharAt(sp, c);
		String bStr = b.toString();
		if(!set.contains(bStr)){
			queue.offer(bStr);
			set.add(bStr);
			route.put(bStr, board);
		}
	}
		
	static boolean solve(){
		String board = queue.poll();
		
		if(board.equals(finalBoard)){
			return false;
		}
		
		sp = board.indexOf("0");
		
		switch(sp){
		case 0:
			move(board, RIGHT);		
			move(board, DOWN);
			break;
		case 1:
		case 2:
			move(board, LEFT);
			move(board, RIGHT);
			move(board, DOWN);
			break;
		case 3:
			move(board, LEFT);
			move(board, DOWN);
			break;
		case 4:
		case 8:
			move(board, RIGHT);
			move(board, UP);
			move(board, DOWN);
			break;
		case 5:
		case 6:
		case 9:
		case 10:
			move(board, LEFT);
			move(board, RIGHT);
			move(board, UP);
			move(board, DOWN);
			break;
		case 7:
		case 11:
			move(board, LEFT);
			move(board, UP);
			move(board, DOWN);
			break;
		case 12:
			move(board, RIGHT);
			move(board, UP);
			break;
		case 13:
		case 14:
			move(board, LEFT);
			move(board, RIGHT);
			move(board, UP);
			break;
		case 15:
			move(board, LEFT);
			move(board, UP);
			break;
		}
		return true;
	}
}
