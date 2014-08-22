/**
 * Created by cristiandrincu on 8/21/14.
 */

exports.handle = function(text, err){
  throw new Error(text + err);
}
