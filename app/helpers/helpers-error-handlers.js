/**
 * Created by cristiandrincu on 8/21/14.
 */

exports.handle = function(text, err){
  err = err ? err.length > 0 : '';
  throw new Error(text, err);
};
