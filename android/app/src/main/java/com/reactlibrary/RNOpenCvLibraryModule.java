package com.reactlibrary;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.WritableArray;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.android.Utils;
import org.opencv.core.MatOfPoint;
import org.opencv.core.Scalar;
import org.opencv.imgproc.Imgproc;

import android.util.Base64;
import android.util.Log;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

// This is for making the cast from byte array to int.
import java.nio.ByteBuffer;
import java.nio.IntBuffer;

public class RNOpenCvLibraryModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public RNOpenCvLibraryModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RNOpenCvLibrary";
    }

    @ReactMethod
    public void segmentImage(String imageAsBase64, Callback errorCallback, Callback successCallback) {
	Log.d("ReactNative-->", "Starting segmentImage");
        try {
            //BitmapFactory.Options options = new BitmapFactory.Options();
            //options.inDither = true;
            //options.inPreferredConfig = Bitmap.Config.ARGB_8888;

	    Log.d("ReactNative-->", "About to call decode");
            byte[] decodedString = Base64.decode(imageAsBase64, Base64.DEFAULT);
	    Log.d("ReactNative-->", "About to call decodeByteArray");
            Bitmap image = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
            // Ignore resizing?

            // Get mat data
            Mat src = new Mat();
            Utils.bitmapToMat(image, src);
	    // get byte data and cast it to int.
	    IntBuffer intBuf = ByteBuffer.wrap(getMatData(src)).asIntBuffer();
	    int[] srcData = new int[intBuf.remaining()];
	    intBuf.get(srcData);
	    // byte[] srcData = getMatData(src);

	    Log.d("got srcData", srcData.toString());
	    
            // Image segmentation
            Mat dst = Mat.zeros(src.rows(), src.cols(), CvType.CV_8UC4);

            // Apply thresholding on src image to differentiate fore vs. background
            Imgproc.cvtColor(src, src, Imgproc.COLOR_RGBA2GRAY, 0);
	    // Arbitrary, taken from
	    // Constants.SEGMENTATION_THRESHOLD_DICT[imageType]
            int threshold = 40;     
            Imgproc.threshold(src, src, threshold, 255, Imgproc.THRESH_BINARY);

            List<MatOfPoint> contours = new ArrayList<>();
            Mat hierarchy = new Mat();
            Imgproc.findContours(src, contours, hierarchy, Imgproc.RETR_CCOMP, Imgproc.CHAIN_APPROX_SIMPLE);

            // Draw contours with random Scalar
            Random random = new Random();
            for (int i = 0; i < contours.size(); ++i) {
                Scalar color = new Scalar(
                    random.nextInt(255),
                    random.nextInt(255),
                    random.nextInt(255)
                );
                Imgproc.drawContours(dst, contours, i, color, -1, Imgproc.LINE_8, hierarchy, 100);
            }

	    // get byte data and cast it to int.
	    intBuf = ByteBuffer.wrap(getMatData(dst)).asIntBuffer();
	    int[] dstData = new int[intBuf.remaining()];
	    intBuf.get(dstData);
	    //byte[] dstData = getMatData(dst);
	    Log.d("ReactNative-->got dstData", dstData.toString());

	    // We do the cast above because the fromArray function
	    // below only wants int.
	    WritableArray srcArray = Arguments.fromArray(srcData);
            WritableArray dstArray = Arguments.fromArray(dstData);
            WritableArray result = Arguments.createArray();
	    Log.d("ReactNative-->converted everyone to arrays", result.toString());
	    
            result.pushArray(srcArray);
            result.pushArray(dstArray);

	    Log.d("ReactNative-->pushes successful", result.toString());
	    
            successCallback.invoke(result);
        } catch (Exception e) {
            errorCallback.invoke(e.getMessage());
        }
    }

    public byte[] getMatData(Mat mat) {
        int size = (int) mat.total() * mat.channels();
        Log.d("ReactNative-->total()", String.valueOf(mat.total()));
        Log.d("ReactNative-->channels()", String.valueOf(mat.channels()));
        Log.d("ReactNative-->cols()", String.valueOf(mat.cols()));
        Log.d("ReactNative-->rows()", String.valueOf(mat.rows()));
        byte[] data = new byte[size];

	Log.d("ReactNative-->data(pre)", data.toString());
        mat.get(mat.rows(), mat.cols(), data);
	Log.d("ReactNative-->data(post)", data.toString());
        return data;
    }

    // Just an example
    @ReactMethod
    public void checkForBlurryImage(String imageAsBase64, Callback errorCallback, Callback successCallback) {
        try {
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inDither = true;
            options.inPreferredConfig = Bitmap.Config.ARGB_8888;

            byte[] decodedString = Base64.decode(imageAsBase64, Base64.DEFAULT);
            Bitmap image = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);


//      Bitmap image = decodeSampledBitmapFromFile(imageurl, 2000, 2000);
            int l = CvType.CV_8UC1; //8-bit grey scale image
            Mat matImage = new Mat();
            Utils.bitmapToMat(image, matImage);
            Mat matImageGrey = new Mat();
            Imgproc.cvtColor(matImage, matImageGrey, Imgproc.COLOR_BGR2GRAY);

            Bitmap destImage;
            destImage = Bitmap.createBitmap(image);
            Mat dst2 = new Mat();
            Utils.bitmapToMat(destImage, dst2);
            Mat laplacianImage = new Mat();
            dst2.convertTo(laplacianImage, l);
            Imgproc.Laplacian(matImageGrey, laplacianImage, CvType.CV_8U);
            Mat laplacianImage8bit = new Mat();
            laplacianImage.convertTo(laplacianImage8bit, l);

            Bitmap bmp = Bitmap.createBitmap(laplacianImage8bit.cols(), laplacianImage8bit.rows(), Bitmap.Config.ARGB_8888);
            Utils.matToBitmap(laplacianImage8bit, bmp);
            int[] pixels = new int[bmp.getHeight() * bmp.getWidth()];
            bmp.getPixels(pixels, 0, bmp.getWidth(), 0, 0, bmp.getWidth(), bmp.getHeight());
            int maxLap = -16777216; // 16m
            for (int pixel : pixels) {
                if (pixel > maxLap)
                    maxLap = pixel;
            }

//            int soglia = -6118750;
            int soglia = -8118750;
            if (maxLap <= soglia) {
                System.out.println("is blur image");
            }

            successCallback.invoke(maxLap <= soglia);
        } catch (Exception e) {
            errorCallback.invoke(e.getMessage());
        }
    }
}
